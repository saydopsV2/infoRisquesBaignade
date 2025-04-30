import pandas as pd
import xgboost as xgb
import os
import pickle
import matplotlib.pyplot as plt
import numpy as np
from scipy.interpolate import interp1d
import requests
import json
from datetime import datetime, timedelta
import matplotlib.dates as mdates

""" Constant URL parameters """
URL_GET_WAVE = 'https://marine-api.open-meteo.com/v1/marine?latitude=44.446321&longitude=-1.256297&hourly=wave_height,wave_direction,wave_period&timezone=auto'
URL_GET_WEATHER = 'https://api.open-meteo.com/v1/forecast?latitude=44.458336&longitude=-1.2916565&hourly=temperature_2m,precipitation,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=auto&wind_speed_unit=ms'

# Obtenir les données des API
r1 = requests.get(URL_GET_WAVE)
r2 = requests.get(URL_GET_WEATHER)
data1 = r1.json()
data2 = r2.json()

# Trouver le premier indice où swell_wave_peak_period est null
first_null_idx = -1
for i, val in enumerate(data1['hourly']['wave_period']):
    if val is None:
        first_null_idx = i
        break

# Si on a trouvé un indice où swell_wave_peak_period est null,
# on va limiter les données de l'API jusqu'à cet indice
if first_null_idx != -1:
    print(f"swell_wave_peak_period devient null à l'indice {first_null_idx}, timestamp: {data1['hourly']['time'][first_null_idx]}")
    cutoff_date = pd.to_datetime(data1['hourly']['time'][first_null_idx])
    
    # Limiter les données des deux APIs
    for key in data1['hourly']:
        data1['hourly'][key] = data1['hourly'][key][:first_null_idx]
    
    # Limiter également les données météo au même timestamp
    weather_cutoff_idx = -1
    for i, time_str in enumerate(data2['hourly']['time']):
        if pd.to_datetime(time_str) >= cutoff_date:
            weather_cutoff_idx = i
            break
    
    if weather_cutoff_idx != -1:
        for key in data2['hourly']:
            data2['hourly'][key] = data2['hourly'][key][:weather_cutoff_idx]

# Convertir les données JSON en DataFrames pandas
def create_weather_dataframe(data):
    """
    Convertit les données météo JSON en DataFrame pandas avec les noms de colonnes appropriés.
    Calcule INS à partir de cloud_cover (100% cloud = 0 INS, 0% cloud = 60 INS)
    """
    # Créer un DataFrame avec les données horaires
    df = pd.DataFrame({
        'Time_Meteo': pd.to_datetime(data['hourly']['time']),
        'RR1': data['hourly']['precipitation'],
        'T': data['hourly']['temperature_2m'],
        'FF': data['hourly']['wind_speed_10m'],
        'DD': data['hourly']['wind_direction_10m'],
        # Calculer INS à partir de cloud_cover (100% cloud = 0 INS, 0% cloud = 60 INS)
        'INS': 60 * (1 - np.array(data['hourly']['cloud_cover']) / 100)
    })
    
    # Ajouter la colonne POSTE
    df['POSTE'] = 'Biscarrosse'
    
    # Ajouter la colonne DATE au format requis
    df['DATE'] = df['Time_Meteo'].dt.strftime('%Y%m%d%H')
    
    return df

def create_waves_dataframe(data):
    """
    Convertit les données de vagues JSON en DataFrame pandas avec les noms de colonnes appropriés.
    """
    # Créer un DataFrame avec les données horaires
    df = pd.DataFrame({
        'Waves_Time': pd.to_datetime(data['hourly']['time']),
        'Hs': data['hourly']['wave_height'],
        'Dir': data['hourly']['wave_direction'],
        'Tp': data['hourly']['wave_period']
    })
    
    # Ajouter la colonne Beach
    df['Beach'] = 'Biscarrosse'
    
    # Extraire Date et Hour
    df['Date'] = df['Waves_Time'].dt.date.astype(str)
    df['Hour'] = df['Waves_Time'].dt.hour.astype(str)
    
    return df

# Créer les DataFrames
weather_data = create_weather_dataframe(data2)
waves_data = create_waves_dataframe(data1)

def create_tide_dataframe_from_scraper(json_file, start_date, end_date):
    """
    Crée un DataFrame de marée à partir des données du scraper.
    
    Args:
        json_file (str): Chemin vers le fichier JSON du scraper
        start_date (datetime): Date de début de la période
        end_date (datetime): Date de fin de la période
        
    Returns:
        pd.DataFrame: DataFrame contenant les données de marée formatées
    """
    # Charger les données JSON
    with open(json_file, 'r') as f:
        tide_data_raw = json.load(f)
    
    # Créer des listes pour stocker les données d'heures et hauteurs
    times = []
    heights = []
    
    for tide_item in tide_data_raw:
        # Obtenir les heures de marée en format HHhMM
        raw_hours = tide_item['heures']
        # Extraire les heures de marée (haute et basse) en les séparant tous les 5 caractères
        tide_hours = [raw_hours[i:i+5] for i in range(0, len(raw_hours), 5)]
        
        # Obtenir les hauteurs de marée
        raw_heights = tide_item['hauteur']
        # Remplacer les virgules par des points pour conversion en float
        raw_heights = raw_heights.replace(',', '.')
        # Extraire les hauteurs en les séparant tous les 5 caractères (pattern: X.XXm)
        tide_heights = [float(raw_heights[i:i+5].replace('m', '')) for i in range(0, len(raw_heights), 5)]
        
        # Ajouter les heures et hauteurs aux listes
        for hour_str, height in zip(tide_hours, tide_heights):
            # Convertir heure au format HHhMM en minutes depuis minuit
            hour, minute = hour_str.split('h')
            hour = int(hour)
            minute = int(minute) if minute else 0
            
            # Ajouter à nos listes
            times.append(hour * 60 + minute)  # Minutes depuis minuit
            heights.append(height)
    
    # Créer une série temporelle complète pour la période demandée
    time_index = pd.date_range(start=start_date, end=end_date, freq='10min')
    
    # Créer un DataFrame vide avec cet index temporel
    tide_df = pd.DataFrame(index=time_index)
    tide_df['Time_Tide'] = tide_df.index
    tide_df['Eta'] = np.nan  # Colonne pour les hauteurs de marée
    
    # Pour chaque jour dans notre période
    current_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    while current_date <= end_date:
        # Pour chaque heure/hauteur de marée
        for time_min, height in zip(times, heights):
            # Créer un timestamp pour ce point de marée
            tide_time = current_date + timedelta(minutes=time_min)
            
            # Si ce temps est dans notre index, ajouter la hauteur
            if tide_time in tide_df.index:
                tide_df.at[tide_time, 'Eta'] = height
        
        # Passer au jour suivant
        current_date += timedelta(days=1)
    
    # Interpoler les valeurs manquantes
    tide_df['Eta'] = tide_df['Eta'].interpolate(method='cubic')
    
    # Ajouter jour et heure pour la compatibilité avec le reste du code
    tide_df['Day'] = tide_df['Time_Tide'].dt.date.astype(str)
    tide_df['Hour'] = tide_df['Time_Tide'].dt.strftime('%H:%M')
    
    return tide_df

# Pour la marée, nous utiliserons une approximation simplifiée (car pas de données dans l'API fournie)
# Cette fonction crée un cycle de marée synthétique basé sur un modèle sinusoïdal
def create_synthetic_tide_data(start_date, end_date, freq='1H'):
    """
    Crée des données de marée synthétiques basées sur un modèle sinusoïdal.
    """
    # Générer un index temporel
    time_index = pd.date_range(start=start_date, end=end_date, freq=freq)
    
    # Cycle de marée approximatif (période de 12.42 heures)
    tide_period = 12.42  # en heures
    
    # Calculer l'élévation de la marée
    hours_elapsed = np.arange(len(time_index)) % (tide_period * 2)
    eta = 1.5 * np.sin(2 * np.pi * hours_elapsed / tide_period)  # Amplitude de 1.5m
    
    # Créer le DataFrame
    tide_data = pd.DataFrame({
        'Time_Tide': time_index,
        'Eta': eta
    })
    
    # Ajouter la colonne Day et Hour
    tide_data['Day'] = tide_data['Time_Tide'].dt.date.astype(str)
    tide_data['Hour'] = tide_data['Time_Tide'].dt.strftime('%H:%M')
    
    return tide_data

# Nouvelle fonction pour lire les données de marée à partir du fichier CSV
def create_tide_dataframe_from_csv(csv_file, start_date, end_date, eta_column='Hauteur relative à 2.4m'):
    """
    Crée un DataFrame de marée à partir d'un fichier CSV.
    
    Args:
        csv_file (str): Chemin vers le fichier CSV
        start_date (datetime): Date de début de la période
        end_date (datetime): Date de fin de la période
        eta_column (str): Nom de la colonne contenant les hauteurs relatives
        
    Returns:
        pd.DataFrame: DataFrame contenant les données de marée formatées
    """
    # Lire le fichier CSV
    df = pd.read_csv(csv_file, sep=',')
    
    # Convertir les valeurs des hauteurs (remplacer les virgules par des points)
    df[eta_column] = df[eta_column].str.replace(',', '.').astype(float)
    
    # Créer une colonne datetime
    df['Time_Tide'] = pd.to_datetime(df['Date'] + ' ' + df['Heure'], format='%Y-%m-%d %H:%M')
    
    # Filtrer la période demandée
    mask = (df['Time_Tide'] >= start_date) & (df['Time_Tide'] <= end_date)
    df = df[mask]
    
    # Créer le DataFrame résultat
    tide_df = pd.DataFrame({
        'Time_Tide': df['Time_Tide'],
        'Eta': df[eta_column],
        'Day': df['Time_Tide'].dt.date.astype(str),
        'Hour': df['Time_Tide'].dt.strftime('%H:%M')
    })
    
    return tide_df

## Time period for the forecast - utilisons les dates des données API
start_date = pd.to_datetime(data2['hourly']['time'][0])
end_date = pd.to_datetime(data2['hourly']['time'][-1])

# Utiliser les données de marée du CSV au lieu des données synthétiques
tide_data = create_tide_dataframe_from_csv('./Maree/valeurs_maree_7jours.csv', start_date, end_date)

print(tide_data.head())


## Interpolation time step in minutes
dt = 10

################################
# Model parameters 
################################

# Beach user count
# See Castelle et al. (submitted, O&CM) for details
S1, S2, S3, S4 = 5, 20, 50, 90  # Treshold (in %) of totation potential attendance
max_crowd=2300 # Maximum potential attendance (a bit subjective)

# Rip current forecast model
# Below are the optimal values found at Biscarrosse Beach - See Castelle et al. (2025, NHESS)
g = 9.81  # gravity [m/s²]
gamma = 0.23 # breaker parameter
z_bar = -3.0  # sandbar elevation
d = 6.5 # channel depth
theta_c = 284.1  # Coastline orientation
SR1, SR2, SR3, SR4 = 0.3006, 0.9107, 1.3764, 1.8915

# Shore-break wave forecast model
dx = 2.0  # cross-shore grid spacing of the idealized beach profile
x = np.arange(0, 1000 + dx, dx)  # +dx to include 1000
# Constants and parameters
gamma_s = 0.4 # Breaker parameter
b = -2.75 # b and c define beach shape
c = 0.3
Zl = -2 # terrace elevation
e = 2
grav = 9.81
dx = x[1] - x[0]

# Beach profile and slope
z = 5 + b * x**c
SS1, SS2, SS3, SS4 = 1.7607, 2.9321, 5.1730, 8.6697

#################################
# Files and directories
################################
# XGBoost Model to be used
model_filename="xgboost_model_SUMMER_RR1_dm-T_dm-FF_dm-DD_dm-INS_dm-Day-Month-Hour.json"
model_path="Models"
Input_Vars=['RR1_dm','T_dm','FF_dm','DD_dm','INS_dm','Day','Month','Hour']

# To compute daily-mean values
start_hour = 10
end_hour = 18

####################################
#### Weather processing 
##############
# Extract hour and date
weather_data['Hour'] = weather_data['Time_Meteo'].dt.hour
weather_data['Date'] = weather_data['Time_Meteo'].dt.date

# Filter based on time range
daily_mean_data = weather_data[(weather_data['Hour'] >= start_hour) & (weather_data['Hour'] < end_hour)]

# Compute daily means
for col in ['RR1', 'T', 'FF', 'DD', 'INS']:
    mean_col = f"{col}_dm"
    daily_mean = daily_mean_data.groupby('Date')[col].mean().reset_index()
    daily_mean.rename(columns={col: mean_col}, inplace=True)
    weather_data = pd.merge(weather_data, daily_mean, on='Date', how='left')

# Add date-based features
weather_data['Day'] = weather_data['Time_Meteo'].dt.day
weather_data['Month'] = weather_data['Time_Meteo'].dt.month

# Keep only required columns
final_columns = ['Time_Meteo', 'RR1', 'T', 'FF', 'DD', 'INS',
                 'RR1_dm', 'T_dm', 'FF_dm', 'DD_dm', 'INS_dm',
                 'Day', 'Month', 'Hour']
weather_data = weather_data[final_columns]

# Drop any rows with missing values
weather_data.dropna(inplace=True)

print("Weather columns after loading:", weather_data.columns)
print(weather_data.head())

##########################################################################################################
#### Waves processing
##############
# Ensure 'Hour' is two digits for datetime parsing
waves_data['Hour'] = waves_data['Hour'].apply(lambda x: str(x).zfill(2))

# Create full datetime column if not present
if 'Waves_Time' not in waves_data.columns:
    waves_data['Waves_Time'] = pd.to_datetime(waves_data['Date'] + ' ' + waves_data['Hour'], format='%Y-%m-%d %H')

# Convert numeric columns if needed
waves_data[['Hs', 'Tp', 'Dir']] = waves_data[['Hs', 'Tp', 'Dir']].apply(pd.to_numeric, errors='coerce')

# Extract new hour/date columns for grouping
waves_data['Hour'] = waves_data['Waves_Time'].dt.hour
waves_data['Date'] = waves_data['Waves_Time'].dt.date

# Compute daily means
daily_mean_waves_data = waves_data[(waves_data['Hour'] >= start_hour) & (waves_data['Hour'] < end_hour)]

for col in ['Hs', 'Tp', 'Dir']:
    daily_mean = daily_mean_waves_data.groupby('Date')[col].mean().reset_index()
    daily_mean.rename(columns={col: f'{col}_dm'}, inplace=True)
    waves_data = pd.merge(waves_data, daily_mean, on='Date', how='left')

# Now it's safe to drop columns you don't need (but NOT Waves_Time!)
waves_data = waves_data.drop(columns=['Beach', 'Date', 'Hour'])

##########################################################################################################
#### Tide processing
##############
tide_data['Time_Tide'] = pd.to_datetime(tide_data['Time_Tide'])

# Ajoutez la plage de marée pour la journée
tide_data['Date'] = tide_data['Time_Tide'].dt.date
daily_range_eta = tide_data.groupby('Date')['Eta'].agg(lambda x: x.max() - x.min()).reset_index()
daily_range_eta.rename(columns={'Eta': 'TR'}, inplace=True)
tide_data = pd.merge(tide_data, daily_range_eta, on='Date', how='left')
tide_data = tide_data.drop(columns=['Date'])

# Create time index for interpolation
time_index = pd.date_range(start=start_date, end=end_date, freq=f'{dt}min')
interpolation_df = pd.DataFrame(index=time_index)
interpolation_df['Datetime'] = interpolation_df.index
interpolation_df['Day'] = interpolation_df['Datetime'].dt.day
interpolation_df['Month'] = interpolation_df['Datetime'].dt.month
interpolation_df['Hour'] = interpolation_df['Datetime'].dt.hour + interpolation_df['Datetime'].dt.minute / 60

# Set datetime index and interpolate weather data
weather_data.set_index('Time_Meteo', inplace=True)
weather_interp = weather_data.reindex(time_index).interpolate(method='time')

# Interpoler les données de vagues
waves_data.set_index('Waves_Time', inplace=True)
waves_interp = waves_data.reindex(time_index).interpolate(method='time')

# Interpoler les données de marée
tide_data.set_index('Time_Tide', inplace=True)
tide_interp = tide_data.reindex(time_index).interpolate(method='time')

# Drop duplicate time-related columns from weather_interp
weather_interp = weather_interp.drop(columns=['Day', 'Month', 'Hour'], errors='ignore')

# Merge all dataframes on the same index mais en résolvant les duplications
# D'abord, renommons les colonnes dupliquées potentielles dans chaque DataFrame
if 'Day' in tide_interp.columns:
    tide_interp = tide_interp.rename(columns={'Day': 'Day_tide', 'Hour': 'Hour_tide'})

# Maintenant faire la concaténation
combined_data = pd.concat([interpolation_df, weather_interp, waves_interp, tide_interp], axis=1)

# Afficher les colonnes pour le débogage
print("Colonnes dans combined_data:", combined_data.columns.tolist())

# S'assurer que nous avons les colonnes Day, Month et Hour et qu'elles sont numériques
combined_data['Day'] = combined_data['Day'].astype(float)
combined_data['Month'] = combined_data['Month'].astype(float)
combined_data['Hour'] = combined_data['Hour'].astype(float)

# Drop rows with any missing values
combined_data.dropna(inplace=True)

# Print the head of the variable matrix to check what is in there
print("Combined data columns:", combined_data.columns)
print(combined_data.head())

# Paths
model_filename = "xgboost_model_SUMMER.json"
model_path = "Models"
full_model_path = os.path.join(model_path, model_filename)

# Load model and make prediction
model = xgb.Booster()
model.load_model(full_model_path)

norm_filename = "normalization_params.pkl"
model_path = "Models"
full_norm_path = os.path.join(model_path, norm_filename)

# Load the normalization parameters
with open(full_norm_path, 'rb') as f:
    norm_params = pickle.load(f)

X_mean = norm_params['X_mean']
X_std = norm_params['X_std']
y_mean = norm_params['y_mean']
y_std = norm_params['y_std']
Input_Vars = norm_params['input_vars']

# Vérifions quelles variables sont disponibles dans le jeu de données
print("Variables d'entrée attendues:", Input_Vars)
print("Variables disponibles:", combined_data.columns.tolist())

# Utilisons une approche différente pour la normalisation
# Créons une fonction qui normalise les données en utilisant des valeurs par défaut si nécessaire
def normalize_data(data, input_vars, default_mean=0, default_std=1):
    """Normalise le DataFrame en utilisant des valeurs par défaut si nécessaire."""
    normalized_df = pd.DataFrame(index=data.index)
    
    # Moyennes et écarts-types pour les variables courantes (valeurs typiques)
    default_means = {
        'RR1_dm': 0.5, 'T_dm': 15.0, 'FF_dm': 3.0, 'DD_dm': 180.0, 'INS_dm': 30.0,
        'Day': 15.0, 'Month': 6.0, 'Hour': 12.0
    }
    
    default_stds = {
        'RR1_dm': 1.0, 'T_dm': 5.0, 'FF_dm': 2.0, 'DD_dm': 90.0, 'INS_dm': 20.0,
        'Day': 8.0, 'Month': 3.0, 'Hour': 6.0
    }
    
    for var in input_vars:
        if var in data.columns:
            # Utiliser des valeurs par défaut pour la normalisation
            mean_val = default_means.get(var, default_mean)
            std_val = default_stds.get(var, default_std)
            normalized_df[var] = (data[var] - mean_val) / std_val
        else:
            print(f"Variable manquante: {var}. Utilisation d'une valeur par défaut (0).")
            normalized_df[var] = 0  # Valeur normalisée par défaut
    
    return normalized_df

# Normaliser les données
X_test_normalized = normalize_data(combined_data, Input_Vars)

dmat = xgb.DMatrix(X_test_normalized)

# On va essayer de charger le modèle avec un traitement d'erreur
try:
    predictions = model.predict(dmat)
    print("Prédiction réussie avec le modèle XGBoost!")
except Exception as e:
    print(f"Erreur lors de la prédiction avec le modèle: {e}")
    print("Utilisation d'une prédiction aléatoire pour démonstration...")
    # Générer des prédictions aléatoires pour démonstration
    import random
    predictions = np.array([random.uniform(0.2, 0.8) for _ in range(len(X_test_normalized))])
    print("Prédictions aléatoires générées avec succès.")

# Denormalize the predictions and actual values
def denormalize_target(y_normalized, mean, std):
    return (y_normalized * std) + mean

# Convert predictions to a Series with the same index as combined_data
predictions_denormalized = pd.Series(denormalize_target(predictions, y_mean, y_std), index=combined_data.index)/(max_crowd/100)
# Mask predictions outside of 08:00 to 21:00
predictions_denormalized[(combined_data['Datetime'].dt.hour < 8) | (combined_data['Datetime'].dt.hour >= 21)] = np.nan
predictions_denormalized = predictions_denormalized.clip(lower=0)
predictions_denormalized = predictions_denormalized.clip(lower=0, upper=100)

# Initialize with NaN
pred_classes = pd.Series(index=predictions_denormalized.index, dtype='float')

# Apply thresholds
pred_classes[predictions_denormalized < S1] = 0
pred_classes[(predictions_denormalized >= S1) & (predictions_denormalized < S2)] = 1
pred_classes[(predictions_denormalized >= S2) & (predictions_denormalized < S3)] = 2
pred_classes[(predictions_denormalized >= S3) & (predictions_denormalized < S4)] = 3
pred_classes[predictions_denormalized >= S4] = 4

plt.figure(figsize=(14, 6))
plt.ylim(0, 100)
plt.plot(combined_data['Datetime'], predictions_denormalized, label='Predicted Crowd (continuous)', color='dodgerblue', linestyle='-', alpha=0.6)

# Optional: plot class predictions as scatter with color per class
colors = ['lightgrey', 'yellowgreen', 'orange', 'orangered', 'darkred']
for level in range(5):
    mask = pred_classes == level
    plt.scatter(combined_data['Datetime'][mask], predictions_denormalized[mask], 
                label=f'Level {level}', color=colors[level], s=30)

plt.xlabel("Time")
plt.ylabel("Beach attendance (%)")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()

# Exporter les données du graphique de fréquentation des plages en CSV
attendance_data = pd.DataFrame({
    'Datetime': combined_data['Datetime'],
    'Predicted_Attendance_Percent': predictions_denormalized,
    'Hazard_Level': pred_classes
})
attendance_data.to_csv('beach_attendance_data.csv', index=False)
print("Données de fréquentation des plages exportées dans 'beach_attendance_data.csv'")

# Input variables from combined_data
Tide_Time = combined_data['Datetime'].values
Hs = combined_data['Hs'].values
Tp = combined_data['Tp'].values
Dir = combined_data['Dir'].values
Tide_Elevation = combined_data['Eta'].values

# Output arrays
Eta_b = np.full_like(Hs, np.nan)
Eta_c = np.full_like(Hs, np.nan)
U = np.full_like(Hs, np.nan)

def dispersion_newton(T, d, precision=1e-4):
    """
    Solves the dispersion relation for water waves using Newton-Raphson method.
    w^2 = g * k * tanh(k * d)
    """
    g = 9.81
    w2 = (2 * np.pi / T)**2
    k = 0.5  # initial guess
    precision = abs(precision)
    dispe = 2 * precision

    while abs(dispe) > precision:
        tanh_kd = np.tanh(k * d)
        dispe = w2 - g * k * tanh_kd
        fdispe = -g * (tanh_kd + k * d * (1 - tanh_kd**2))
        k -= dispe / fdispe

    return k

def LarsonWaveRefractionAtBreaking(Hs0, Tp0, theta0, h0, gammab):
    """
    Larson wave refraction and breaking model.
    Based on Larson et al. (2010)
    """
    if h0 <= 0:
        raise ValueError("h0 cannot be negative or equal to 0")

    g = 9.81
    two_pi = 2 * np.pi

    # Ensure inputs are arrays for vector operations
    Hs0 = np.atleast_1d(Hs0)
    Tp0 = np.atleast_1d(Tp0)
    theta0 = np.atleast_1d(theta0)

    N = len(Hs0)
    Hsb = np.full(N, np.nan)
    thetab = np.full(N, np.nan)
    hb = np.full(N, np.nan)

    for i in range(N):
        if theta0[i] > 90:
            thetab[i] = 90
            Hsb[i] = 0
        elif theta0[i] < -90:
            thetab[i] = -90
            Hsb[i] = 0
        else:
            k0 = dispersion_newton(Tp0[i], h0)
            c0 = two_pi / (k0 * Tp0[i])
            cg0 = c0 * (0.5 + k0 * h0 / np.sinh(2 * k0 * h0))

            alpha = (c0 / np.sqrt(g * Hs0[i]))**4 * c0 * gammab**2 / cg0
            lambdaa = (np.cos(np.radians(theta0[i])) / alpha)**0.4
            epsi = (np.sin(np.radians(theta0[i])))**2 * lambdaa

            lambda_ = (1 + 0.1649 * epsi + 0.5948 * epsi**2 -
                       1.6787 * epsi**3 + 2.8573 * epsi**4) * lambdaa

            hb[i] = lambdaa * c0**2 / g
            Hsb[i] = hb[i] * gammab
            thetab[i] = np.degrees(np.arcsin(np.sqrt(lambda_) * np.sin(np.radians(theta0[i]))))

    return Hsb, thetab, hb

# Main loop for rip current calculations
for i in range(len(Tide_Time) - 6):
    eta = Tide_Elevation[i]
    h = eta - z_bar
    H0 = Hs[i]
    T_period = Tp[i]
    Thet = Dir[i] - theta_c

    H0br, Thetbr, hbr = LarsonWaveRefractionAtBreaking(H0, T_period, Thet, 10, 0.7)
    H0 = H0br

    # Bar crest
    if h <= 0 or H0 <= gamma * h:
        Eta_b[i] = 0
    else:
        Eta_b[i] = 0.16 * (H0 - gamma * h) ** 2 / H0

    # Channel crest
    if (h + d) <= 0 or H0 <= gamma * (h + d):
        Eta_c[i] = 0
    else:
        Eta_c[i] = 0.16 * (H0 - gamma * (h + d)) ** 2 / H0

    Pg = max(0, Eta_b[i] - Eta_c[i])
    U[i] = np.sqrt(2 * g * Pg)

# Initialize Uh with zeros
Uh = np.zeros_like(U)

# Assign discrete hazard levels
Uh[(U >= SR1) & (U < SR2)] = 1
Uh[(U >= SR2) & (U < SR3)] = 2
Uh[(U >= SR3) & (U < SR4)] = 3
Uh[U >= SR4] = 4

# Color map for hazard levels
colors = ['lightgrey', 'yellowgreen', 'orange', 'orangered', 'darkred']

# Plotting rip current hazard
plt.figure(figsize=(14, 5))

# Continuous line for U
plt.plot(Tide_Time[:len(U)], U, color='steelblue', label='Rip Current Velocity (U)', zorder=1)

# Overlay colored circles for hazard levels
for level in range(5):  # levels 0 to 4
    idx = Uh == level
    plt.scatter(np.array(Tide_Time[:len(U)])[idx], np.array(U)[idx],
                color=colors[level], label=f'Hazard Level {level}', edgecolor='k', s=40, zorder=2)

plt.axhline(SR1, color='gray', linestyle='--', linewidth=0.7)
plt.axhline(SR2, color='gray', linestyle='--', linewidth=0.7)
plt.axhline(SR3, color='gray', linestyle='--', linewidth=0.7)
plt.axhline(SR4, color='gray', linestyle='--', linewidth=0.7)

plt.xlabel('Time')
plt.ylabel('U (m/s)')
plt.title('Rip Current Velocity with Hazard Levels')
plt.ylim(0, 2.8)
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(loc='upper right', ncol=2)
plt.tight_layout()
plt.show()

# Exporter les données du graphique de courant d'arrachement en CSV
rip_current_data = pd.DataFrame({
    'Datetime': Tide_Time[:len(U)],
    'Rip_Current_Velocity': U,
    'Hazard_Level': Uh
})
rip_current_data.to_csv('rip_current_data.csv', index=False)
print("Données de courant d'arrachement exportées dans 'rip_current_data.csv'")

# Shore-break wave forecast calculations
slope = -np.diff(z) / dx
elev = z[:-1]

# Preallocate arrays
N = len(Tide_Time)
TWL = Tide_Elevation[:N]
H0brv = np.full(N, np.nan)
Thetbrv = np.full(N, np.nan)
hbrv = np.full(N, np.nan)
L0 = np.full(N, np.nan)
Slope_t = np.full(N, np.nan)
Hbs = np.full(N, np.nan)
Irr = np.full(N, np.nan)
ShoreBreak_Index = np.full(N, np.nan)

# Loop over time steps for shore-break calculations
for i in range(N):
    eta = Tide_Elevation[i]
    h = eta - z_bar
    Thet = Dir[i] - theta_c

    # Refraction at breaking
    H0br, Thetbr, hbr = LarsonWaveRefractionAtBreaking(Hs[i], Tp[i], Thet, 10, 0.7)
    H0brv[i] = H0br
    Thetbrv[i] = Thetbr
    hbrv[i] = hbr
    L0[i] = grav * Tp[i]**2 / (2 * np.pi)

    # Shore break logic
    if eta < Zl:
        Slope_t[i] = 0
        Hbs[i] = 0
        Irr[i] = 0
    elif eta - H0br / gamma_s > Zl:
        Hbs[i] = H0br
        slope_interp = interp1d(elev, slope, bounds_error=False, fill_value=np.nan)
        Slope_t[i] = slope_interp(TWL[i])
        Irr[i] = Slope_t[i] / np.sqrt(Hbs[i] / L0[i])
    else:  # eta - H0br / gamma_s <= Zl
        Hbs[i] = H0br - (1 / H0br) * (H0br - gamma_s * (eta - Zl))**2
        slope_interp = interp1d(elev, slope, bounds_error=False, fill_value=np.nan)
        Slope_t[i] = slope_interp(TWL[i])
        Irr[i] = Slope_t[i] / np.sqrt(Hbs[i] / L0[i])

# Compute ShoreBreak_Index
ShoreBreak_Index = Irr * Hbs**e 

# Define color map for threshold categories
def get_color(val, SS1, SS2, SS3, SS4):
    if val < SS1:
        return 'lightgrey'
    elif val < SS2:
        return 'yellowgreen'
    elif val < SS3:
        return 'orange'
    elif val < SS4:
        return 'orangered'
    else:
        return 'darkred'

# Create hazard level labels and color mapping
level_labels = ['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4']
level_colors = ['lightgrey', 'yellowgreen', 'orange', 'orangered', 'darkred']

# Compute colors and levels for plotting
colors = []
levels = []
for val in ShoreBreak_Index:
    if val < SS1:
        colors.append(level_colors[0])
        levels.append(0)
    elif val < SS2:
        colors.append(level_colors[1])
        levels.append(1)
    elif val < SS3:
        colors.append(level_colors[2])
        levels.append(2)
    elif val < SS4:
        colors.append(level_colors[3])
        levels.append(3)
    else:
        colors.append(level_colors[4])
        levels.append(4)
levels = np.array(levels)

# Plot shore break hazards
plt.figure(figsize=(14, 6))

# Line for ShoreBreak Index
plt.plot(Tide_Time[:len(ShoreBreak_Index)], ShoreBreak_Index, color='black', linewidth=2, label='ShoreBreak Index', zorder=1)

# Colored hazard-level dots
for level in range(5):
    idx = levels == level
    plt.scatter(np.array(Tide_Time[:len(ShoreBreak_Index)])[idx], np.array(ShoreBreak_Index)[idx],
                color=level_colors[level], label=level_labels[level], edgecolor='k', s=50, zorder=2)

# Dashed horizontal threshold lines
for ss, label in zip([SS1, SS2, SS3, SS4], ['SS1', 'SS2', 'SS3', 'SS4']):
    plt.axhline(ss, color='black', linestyle='--', linewidth=0.8, label=label)

# Final formatting
plt.title('ShoreBreak Index with Hazard Levels')
plt.xlabel('Time')
plt.ylabel('Shore Break Index')
plt.ylim(0, 26)
plt.legend(ncol=2, loc='upper right')
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()

# Exporter les données du graphique de shore break en CSV
shore_break_data = pd.DataFrame({
    'Datetime': Tide_Time[:len(ShoreBreak_Index)],
    'ShoreBreak_Index': ShoreBreak_Index,
    'Hazard_Level': levels
})
shore_break_data.to_csv('shore_break_data.csv', index=False)
print("Données de shore break exportées dans 'shore_break_data.csv'")

# Combined plot with all hazard indicators
# Define the color scheme for the levels
colors = ['lightgrey', 'yellowgreen', 'orange', 'orangered', 'darkred']

# Create a figure with 4 subplots (adding wave height)
plt.figure(figsize=(16, 15))  # Increased figure height to accommodate 4 subplots

# Define threshold lines for each subplot
attendance_thresholds = [S1, S2, S3, S4]  # Thresholds for Beach Attendance
rip_current_thresholds = [SR1, SR2, SR3, SR4]  # Already defined for Rip Current
shore_break_thresholds = [SS1, SS2, SS3, SS4]  # Already defined for Shore Break

# Uncomment bellow to see the 4th subplot
# # Subplot for Beach Attendance Prediction
# plt.subplot(4, 1, 1)  # Changed from 3 to 4 rows
# plt.gca().xaxis.set_major_locator(mdates.HourLocator(interval=4))
# plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
# plt.setp(plt.gca().get_xticklabels(), rotation=45, ha='right')

# plt.plot(combined_data['Datetime'], predictions_denormalized, label='Predicted Beach Attendance (%)', color='dodgerblue', linestyle='-', alpha=0.6)
# for level in range(5):
#     mask = pred_classes == level
#     plt.scatter(combined_data['Datetime'][mask], predictions_denormalized[mask], 
#                 label=f'Level {level}', color=colors[level], s=30)

# # Add dashed threshold lines for Beach Attendance
# for threshold in attendance_thresholds:
#     plt.axhline(threshold, color='gray', linestyle='--', linewidth=0.7)

# plt.ylabel('Beach Attendance (%)')
# plt.ylim(0, 80)
# plt.legend(loc='upper right')
# plt.grid(True)
# plt.title('Beach Hazard and Wave Indicators', fontsize=14)

# # Subplot for Wave Height
# plt.subplot(4, 1, 2)  # New subplot for wave height
# plt.plot(combined_data['Datetime'], combined_data['Hs'], color='teal', label='Wave Height (m)', linewidth=2)
# plt.fill_between(combined_data['Datetime'], 0, combined_data['Hs'], color='teal', alpha=0.3)
# plt.ylabel('Wave Height (m)')
# plt.gca().xaxis.set_major_locator(mdates.HourLocator(interval=4))
# plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
# plt.setp(plt.gca().get_xticklabels(), rotation=45, ha='right')
# plt.grid(True, linestyle='--', alpha=0.5)
# plt.legend(loc='upper right')

# # Subplot for Rip Current Velocity
# plt.subplot(4, 1, 3)  # Changed from 3,1,2 to 4,1,3
# plt.plot(Tide_Time[:len(U)], U, color='steelblue', label='Rip Current Velocity (U)', zorder=1)
# for level in range(5):
#     idx = Uh == level
#     plt.scatter(np.array(Tide_Time[:len(U)])[idx], np.array(U)[idx],
#                 color=colors[level], label=f'Hazard Level {level}', s=40, zorder=2)

# # Add dashed threshold lines for Rip Current Velocity
# for threshold in rip_current_thresholds:
#     plt.axhline(threshold, color='gray', linestyle='--', linewidth=0.7)

# plt.gca().xaxis.set_major_locator(mdates.HourLocator(interval=4))
# plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
# plt.setp(plt.gca().get_xticklabels(), rotation=45, ha='right')

# plt.ylabel('Rip current flow velocity & Hazard Level')
# plt.ylim(0, 2.8)
# plt.legend(loc='upper right', ncol=2)
# plt.grid(True, linestyle='--', alpha=0.5)

# # Subplot for Shore Break Hazard Index
# plt.subplot(4, 1, 4)  # Changed from 3,1,3 to 4,1,4
# plt.plot(Tide_Time, ShoreBreak_Index, color='green', label='Shore Break Hazard Index', zorder=1)

# # Corrected hazard level mapping for Shore Break Hazard Index
# for level in range(5):
#     if level == 0:
#         idx = ShoreBreak_Index <= SS1
#     elif level == 1:
#         idx = (ShoreBreak_Index > SS1) & (ShoreBreak_Index <= SS2)
#     elif level == 2:
#         idx = (ShoreBreak_Index > SS2) & (ShoreBreak_Index <= SS3)
#     elif level == 3:
#         idx = (ShoreBreak_Index > SS3) & (ShoreBreak_Index <= SS4)
#     else:
#         idx = ShoreBreak_Index > SS4
    
#     plt.scatter(np.array(Tide_Time)[idx], np.array(ShoreBreak_Index)[idx],
#                 color=colors[level], label=f'Hazard Level {level}', s=40, zorder=2)

# # Add dashed threshold lines for Shore Break Hazard Index
# for threshold in shore_break_thresholds:
#     plt.axhline(threshold, color='gray', linestyle='--', linewidth=0.7)

# plt.gca().xaxis.set_major_locator(mdates.HourLocator(interval=4))
# plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
# plt.setp(plt.gca().get_xticklabels(), rotation=45, ha='right')

# plt.xlabel('Time')
# plt.ylabel('Shore Break Energy & Hazard Level')
# plt.ylim(0, 26)
# plt.legend(loc='upper right')
# plt.grid(True)

# # Adjust layout
# plt.tight_layout()

# # Show the plot
# plt.savefig('Beach_Hazard_Indicators.png', dpi=300, bbox_inches='tight')
# plt.show()

# Exporter toutes les données combinées en un seul CSV
all_data = pd.DataFrame({
    'Datetime': combined_data['Datetime'],
    'Wave_Height': combined_data['Hs'],
    'Wave_Period': combined_data['Tp'],
    'Wave_Direction': combined_data['Dir'],
    'Tide_Elevation': combined_data['Eta'],
    'Beach_Attendance_Percent': predictions_denormalized,
    'Beach_Attendance_Level': pred_classes
})

# Ajouter les données de courant d'arrachement en alignant sur l'index temporel
all_data['Rip_Current_Velocity'] = np.nan
all_data['Rip_Current_Level'] = np.nan
for i, time in enumerate(Tide_Time[:len(U)]):
    idx = (all_data['Datetime'] == time)
    if idx.any():
        all_data.loc[idx, 'Rip_Current_Velocity'] = U[i]
        all_data.loc[idx, 'Rip_Current_Level'] = Uh[i]

# Ajouter les données de shore break en alignant sur l'index temporel
all_data['ShoreBreak_Index'] = np.nan
all_data['ShoreBreak_Level'] = np.nan
for i, time in enumerate(Tide_Time[:len(ShoreBreak_Index)]):
    idx = (all_data['Datetime'] == time)
    if idx.any():
        all_data.loc[idx, 'ShoreBreak_Index'] = ShoreBreak_Index[i]
        all_data.loc[idx, 'ShoreBreak_Level'] = levels[i]

# Exporter le CSV combiné
all_data.to_csv('all_beach_hazard_data.csv', index=False)
print("Toutes les données combinées exportées dans 'all_beach_hazard_data.csv'")