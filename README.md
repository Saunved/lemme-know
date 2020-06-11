# About
lemme-know works by checking if the list of websites you have specified are up and sending an email (optional) if they are down. It also works locally and notifies you if a website is down. 

# Installation

```shell
npm i lemme-know -g
```

# Usage 

### Get informed by email

```shell
lemme-know -se settings.json
```
-e = send email  
-s = silent mode (does not show output on the GUI)

settings.json is any JSON file that contains your...settings. 

Valid settings are:
| Key | Value(s) |
|-------|----------|
|websites|array of strings with valid website names (with protocol)|
|mail.host|your email host (e.g. smtp.example.com)|
|mail.port|the port number (587, 465, 25)
|mail.secure|boolean|
|mail.auth.user|your email/username|
|mail.auth.pass|your password|
|mail.subject|the subject of your email|
|mail.sender|sender email ID|
|mail.receiver|comma-separated list of receivers|

For example:
```json
{
    "websites": [
        "https://test.example.com",
        "http://example.com",
        "http://another.example.com"
    ],
    "mail": {
        "host": "smtp.example.com", //could be smtp.gmail.com
        "port": 587,
        "secure": false,
        "auth": {
            "user": "you@example.com", // could be your gmail username
            "pass": "supersecretstuff" // could be your gmail password
        },
        "subject": "Website(s) may be down!",
        "sender": "you@example.com",
        "receiver": "you@example.com, yourdev@example.com"
    }
}
```
You may have to turn off secure apps if you want to use the Gmail SMTP server [here](https://myaccount.google.com/lesssecureapps)

## Locally
lemme-know can work locally as well as in the cloud. If you don't want to be informed by email, you can simply do:
```shell
lemme-know settings.json
```

This will show you a nice table with the status of your websites in the terminal itself.

## Change the frequency
Change how often lemme-know checks if a website is down (default value is every 30 minutes)
To check every 10 minutes, you can do:
```shell
lemme-know -es settings.json -r 10 
```

Keep in mind that if you are checking other websites (I'd suggest you don't), they might block you for pinging them constantly. If you want to ensure that your own websites are prevented from DOS attacks, you can add the monitoring IP to a whitelist.
