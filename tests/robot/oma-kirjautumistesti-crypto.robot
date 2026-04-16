*** Settings ***
Library    Browser
Library    CryptoLibrary    variable_decryption=True

*** Variables ***
${URL}    http://localhost:5173
${USERNAME}        crypt:m3mDMQUHLhvwqKi7CoKh4B0hwobx5nuatQxEN85GxDigHzp0amD7YCu4vPzYE6oU6q+q5aY=
${PASSWORD}        crypt:NiUfKt5OX32RJRTotLlEbgZpWrt3qs0Epm8gQWTQ0yQ3BX+2ST8Z/zxY2rBtbUAvFTinW1M=

*** Test Cases ***
Login With Crypto Credentials
    New Browser    chromium    headless=No
    New Context
    New Page    ${URL}

    Click    css=button.site-auth-trigger
    Wait For Elements State    text=Tunnistautuminen    visible

    Type Text    css=#siteAuthUsername    ${USERNAME}
    Type Secret    css=#siteAuthPassword    $PASSWORD
    Click    css=.site-auth-login-form button[type="submit"]

    Wait For Elements State    css=button.site-auth-trigger    visible
    Get Text    css=button.site-auth-trigger    contains    ${USERNAME}