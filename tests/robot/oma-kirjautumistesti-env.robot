*** Settings ***
Library    Browser
Variables    ../load_env.py

*** Test Cases ***
Login With Env Credentials
    New Browser    chromium    headless=No
    New Context
    New Page    ${FRONTEND_URL}

    Click    css=button.site-auth-trigger
    Wait For Elements State    text=Tunnistautuminen    visible

    Type Text    css=#siteAuthUsername    ${USERNAME}
    Type Text    css=#siteAuthPassword    ${PASSWORD}
    Click    css=.site-auth-login-form button[type="submit"]

    Wait For Elements State    css=button.site-auth-trigger    visible
    Get Text    css=button.site-auth-trigger    contains    ${USERNAME}