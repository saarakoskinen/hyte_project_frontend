*** Settings ***
Library    Browser
Resource    keywords.robot

*** Variables ***
${URL}         http://localhost:5173
${ACTIVITY}     Kuntopyöräily

*** Test Cases ***
Add Diary Entry
    New Browser     chromium    headless=No
    New Context
    New Page        ${URL}

    Click    css=button.site-auth-trigger
    Wait For Elements State    text=Tunnistautuminen    visible

    Type Text    css=#siteAuthUsername    ${USERNAME}
    Type Text    css=#siteAuthPassword    ${PASSWORD}
    Click        css=.site-auth-login-form button[type="submit"]

    Click    text=Omat merkinnät
    Wait For Elements State    input[type="date"]    visible

    Fill Text    input[type="date"]    2026-04-13
    Type Text    input[placeholder="esim. Kävely"]    ${ACTIVITY}
    Type Text    input >> nth=3    4
    Type Text    input[placeholder="h"]    2
    Type Text    input[placeholder="min"]    15

    Click    text=Tallenna
    Wait For Elements State    css=table    visible
    Get Text    css=table    contains    ${ACTIVITY}