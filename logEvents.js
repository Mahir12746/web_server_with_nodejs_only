//npm CLI; CLI = Command Line Interface

// The error message you're seeing is due to PowerShell's execution policy, which is preventing the nodemon.ps1 script from running. This is a security feature in PowerShell to prevent unauthorized scripts from running.

// You can change the execution policy using the Set-ExecutionPolicy cmdlet. However, please be aware that changing the execution policy can expose your system to security risks.

// To change the execution policy for the current user only, you can open a PowerShell terminal as an administrator and run:

//Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

// This will allow scripts downloaded from the internet to run if they have been signed by a trusted publisher.

// If you trust the scripts you are running and understand the risks, you can set the policy to Unrestricted:

//Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted

// This will allow all scripts to run.

// After changing the execution policy, try running nodemon again.



//they required npm
const {format} = require('date-fns');

const {v4:uuid} = require('uuid');




//these are common core modules
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    console.log(logItem);
    try{
        if (!fs.existsSync(path.join(__dirname, 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, 'logs'));
        }
        //testing
        await fsPromises.appendFile(path.join(__dirname, 'logs', logName), logItem);
    } catch(err){
        console.log(err);
    }
}

module.exports = logEvents; //exporting the function to be used in other files