const { execSync,exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class PythonEnvironment {
    constructor(venvPath) {
        this.venvPath = venvPath;
        console.log(__dirname);
        //this.createEnvironment = this.createEnvironment.bind(this);
    }

    createEnvironment() {
        if (!fs.existsSync(this.venvPath)) {
            const pythonExecutable = "python3.7"
            const createCommand = `${pythonExecutable} -m venv ${this.venvPath}`;
            try {
                execSync(createCommand);
                return {status: true, message: 'Environment created successfully'};
            }
            catch (e) {
                return {status: false, message: e.message};
            }
        } else {
            return {status: true, message: 'Environment already exists'};
        }
    }

    runCommand(command) {
        const activateScript = this.isWindows() ? 'Scripts\\activate.bat' : 'bin/activate';
        const activatePath = path.join(this.venvPath, activateScript);
        const activateCommand = this.isWindows() ? activatePath : `source ${activatePath}`;

        const fullCommand = `${activateCommand} && ${command}`;
        //const result = execSync(fullCommand).toString();
        return new Promise((resolve, reject) => {
            exec(fullCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        })
    }

    isWindows() {
        return process.platform === 'win32';
    }
}

export default PythonEnvironment;
