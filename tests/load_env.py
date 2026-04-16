import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('API_KEY')
BASE_URL = os.getenv('BASE_URL')

#oma-kirjautumistesti-env.robot

USERNAME = os.getenv('USERNAME')
PASSWORD = os.getenv('PASSWORD')
FRONTEND_URL = os.getenv('FRONTEND_URL')