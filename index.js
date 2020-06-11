#!/usr/bin/env node
'use strict';

const program = require('commander');
const shell = require('shelljs');
var fs = require('fs');
var colors = require('colors'); //  this is used by Table
var Table = require('cli-table');
const nodemailer = require('nodemailer');
const isup = require('is-up');

var table = new Table({
    head: ['Website'.blue, 'Status'.blue, 'Last checked'.blue]
});

/* Welcome to my (spaghetti) code :) */
program
    .arguments('[file]')
    .option('-r, --repeat <time>', 'Perform the check every [time] minutes', '30')
    .option('-e, --email', 'Send an email when a server crashes based on the information in the file')
    .option('-s, --silent', 'Run in silent mode (useful with the -e option)')
    .option('-t, --test', 'Sends an email using the ethereal service and outputs a preview URL')
    .description('JSON file containing the an array of "websites" and nodemailer "mail" settings')
    .action(function (file, args) {
        let settings = {};
        if(args.test){
            args.silent = true;
            settings.websites = ['http://example.com', 'http://test.example.com']
            console.log('Running the test with http://example.com and http://test.example.com')
        }
        else{
            if(!file){
                console.log('Please specify a JSON file');
                return;
            }
            settings = JSON.parse(fs.readFileSync(process.cwd() + '/' + file.toString(), 'utf-8'));
            setInterval(runScripts, 1000 * 60 * args.repeat);
        }

        runScripts();

        async function runScripts() {
            table = new Table({
                head: ['Website'.blue, 'Status'.blue]
            });

            let lastChecked = new Date(Date.now()).toLocaleString();
            let tracker = [];
            let offline = [];
            for (let website of settings.websites) {
                try {
                    let live = await isup(website);
                    let message = 'ONLINE'.green;
                    if (!live) {
                        offline.push(website)
                        message = 'OFFLINE'.red
                    }
                    tracker.push({ website: website, status: live })
                    table.push([website, message, lastChecked]);
                }
                catch (err) {
                    console.log(err);
                    console.log(`\nEncountered an error. Will try again in ${args.repeat} minutes`)
                    return;
                }

            }

            if (offline.length > 0) {
                if (!args.silent) {
                    shell.exec(`notify-send 'Server tracker' '${offline.toString()} may be down'`)
                }

                if (args.email || args.test) {
                    setupNodemailerAndSendMail(settings.mail, offline, args.test)
                }
            }

            if (!args.silent) {
                shell.exec('reset');
                console.log(table.toString());
                console.log('Next check will start at ' + new Date(Date.now() + 1000 * 60 * args.repeat).toLocaleString())
            }
        }
    });


async function setupNodemailerAndSendMail(transport, offline, isTest) {

    // Passing variables using the dot notation to createTransport() function 
    // causes some issues. Not sure why, but assigning them this way works
    if(isTest){
        var testAccount = await nodemailer.createTestAccount();
        var host = 'smtp.ethereal.email';
        var port = 587;
        var secure = false;
        var user = testAccount.user;
        var pass = testAccount.pass;
        var sender = 'foo@example.com';
        var receiver = 'bar@example.com';
        var subject = 'Website(s) may be down';
    }
    else{
        var host = transport.host;
        var port = transport.port;
        var secure = transport.secure;
        var user = transport.auth.user;
        var pass = transport.auth.pass;
        var sender = transport.sender;
        var receiver = transport.receiver;
        var subject = transport.subject;
    }

    let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
            user: user,
            pass: pass
        }
    });

    let info = await transporter.sendMail({
        from: sender,
        to: receiver,
        subject: subject || 'Letting you know that website(s) are down!',
        text: `${offline.toString()} may be down`,
        html: `<b>${offline.toString()}</b> may be down</b>`
    })

    if(isTest){
        console.log('Preview URL: %s',nodemailer.getTestMessageUrl(info))
    }
}

program.parse(process.argv);