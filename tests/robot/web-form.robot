*** Settings ***
Documentation     Esimerkki ympäristömuuttujien käytöstä
Library           Collections
Variables         ../load_env.py
Library           Browser
Library           CryptoLibrary     variable_decryption=True

*** Variables ***
${Username}    crypt:chX9Sr6sqxqzgENwfBKqpIUqY1+gfz/RrDmIM/170WLiK72TsX8jiYUFo0kaqJO/6QbI91EhxuSK0kTdOiNTt6A=
${Password}    crypt:nPpWxWCvhxGMkAuAaxJgKCS0ISmXOQrQ6FMQ2Qr88S3iU/rSfkEIYnAMZ3Iz+wTgxpT0eop9M8c= 
${Message}     Hello, Robot Framework!\nHow are you today?

*** Test Cases ***
Example Test Case
    [Documentation]    Esimerkkitapaus, jossa käytetään ympäristömuuttujia
    Log    API Key: ${API_KEY}
    Log    Base URL: ${BASE_URL}

Test Web Form
    New Browser     chromium    headless=No
    New Context     viewport={'width': 800, 'height': 600}
    New Page        https://www.selenium.dev/selenium/web/web-form.html 
    Get Title       ==    Web form  
    Type Text       [name="my-text"]        ${Username}    delay=0.1 s 
    Type Secret     [name="my-password"]    $Password      delay=0.1 s
    Type Text       [name="my-textarea"]    ${Message}     delay=0.1 s

# Testit Dropdown (select), Dropdown (datalist), File input, Checkboxit, Radio buttonit
    Select Options By    [name="my-select"]    value    2
    Type Text            [name="my-datalist"]    New York
    Upload File By Selector    [name="my-file"]    ${CURDIR}/test.txt
    Check Checkbox       [id="my-check-2"]
    Click                [id="my-radio-2"]

    Click With Options    button                           delay=2 s
    Get Text        id=message    ==    Received!
    Sleep           2.0 s