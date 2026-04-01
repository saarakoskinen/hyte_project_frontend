*** Settings ***
Library    Browser    auto_closing_level=KEEP
Resource    keywords.robot

*** Variables ***
${URL}    http://localhost:5173

*** Test Cases ***
Login To Own Site Successfully
    New Browser    chromium    headless=No
    New Page    ${URL}

    Click    css=button.site-auth-trigger
    Wait For Elements State    text=Tunnistautuminen    visible

    Wait For Elements State    css=input >> nth=0    visible
    Type Text    css=input >> nth=0    ${Username}
    Type Secret    css=input >> nth=1    $Password
    Click    css=button[type="submit"] >> nth=0
