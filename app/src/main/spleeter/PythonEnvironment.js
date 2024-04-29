const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class PythonEnvironment {
    constructor(venvPath) {
        this.venvPath = venvPath;
        //this.createEnvironment = this.createEnvironment.bind(this);
    }

    createEnvironment() {
        if (!fs.existsSync(this.venvPath)) {
            const pythonExecutable = "python3.7"
            const createCommand = `${pythonExecutable} -m venv ${this.venvPath}`;
            try {
                execSync(createCommand);
                return true
            }
            catch (e) {
                return false
            }
        } else {
            return true
        }
    }

    runCommand(command) {
        const activateScript = this.isWindows() ? 'Scripts\\activate.bat' : 'bin/activate';
        const activatePath = path.join(this.venvPath, activateScript);
        const activateCommand = this.isWindows() ? activatePath : `source ${activatePath}`;

        const fullCommand = `${activateCommand} && ${command}`;
        const result = execSync(fullCommand).toString();
        return result;
    }

    isWindows() {
        return process.platform === 'win32';
    }
}

export default PythonEnvironment;
