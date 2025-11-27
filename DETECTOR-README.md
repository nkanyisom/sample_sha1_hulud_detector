# SHA-1 HULUD Compromised Package Detector - POC

**Proof of Concept (POC)** for detecting and preventing deployment of compromised npm packages from the SHA-1 HULUD supply chain incident (November 2025).

## 🚀 Quick Start - How to Use This Detector in Your Project

To integrate this compromised package detector into your own npm project, follow these steps:

### Step 1: Copy Required Files

Copy these two files to your project root:

1. **`detect-compromised.js`** - The detector script
2. **`sha1_hulud_full.csv`** - The compromised packages database (found in `angular-app/src/app/compromise/`)

```bash
# Example: Copy files to your project
cp detect-compromised.js /path/to/your-project/
cp angular-app/src/app/compromise/sha1_hulud_full.csv /path/to/your-project/
```

### Step 2: Update Your package.json

Add security scanning hooks to your `package.json`:

```json
{
  "scripts": {
    "security:scan": "node detect-compromised.js --scan .",
    "prestart": "npm run security:scan",
    "prebuild": "npm run security:scan",
    "pretest": "npm run security:scan"
  }
}
```

**What this does:**
- `security:scan` - Manual security scan command
- `prestart` - Automatically scans before `npm start` (blocks if compromised packages found)
- `prebuild` - Automatically scans before `npm run build` (blocks if compromised packages found)
- `pretest` - Automatically scans before `npm test` (blocks if compromised packages found)

### Step 3: Run the Scanner

**Manual scan:**
```bash
node detect-compromised.js
```

**Automated scan (via npm hooks):**
```bash
npm start    # Triggers prestart hook → scans → starts app if safe
npm run build # Triggers prebuild hook → scans → builds if safe
npm test     # Triggers pretest hook → scans → tests if safe
```

### Step 4: Review Results

If compromised packages are found:
- The script exits with code `1` (blocks npm command)
- Console shows detailed vulnerability information
- JSON report saved to `compromise-scan-report.json`

If no vulnerabilities:
- Script exits with code `0` (continues with npm command)
- App/build/tests proceed normally

### Optional: Customize CSV Path

If you store the CSV in a different location, update the default path in `detect-compromised.js` or use the `--csv` flag:

```bash
node detect-compromised.js --csv ./path/to/sha1_hulud_full.csv
```

---

## Project Purpose

This is a **security demonstration project** that showcases:
- ✅ Automated detection of compromised npm packages
- ✅ Prevention of application startup with vulnerable dependencies
- ✅ Integration with development workflows (npm scripts)
- ✅ CI/CD pipeline integration capabilities
- ✅ Practical approach to supply chain security

**Note**: This project includes simulated compromised packages for demonstration purposes only.

## Overview

This detection script:
- ✅ Recursively scans `node_modules/**/package.json` files
- ✅ Compares installed package versions against compromised ranges from CSV
- ✅ Outputs a machine-readable JSON report
- ✅ Provides human-readable console summary
- ✅ Supports semantic version comparison (x.y.z format)
- ✅ Handles both version ranges (1.0.0-1.0.2) and single versions (0.1.1)
- ✅ Blocks application startup when vulnerabilities detected
- ✅ Works with any npm-based project (Angular, React, Node.js, etc.)

## How the Detection Process Works

### 1. **CSV Data Loading**
The script reads `sha1_hulud_full.csv` containing 48 compromised packages:

```csv
Package Name,Version Range,Ecosystem,Source URL
@postman/secret-scanner-wasm,2.1.2-2.1.4,npm,https://...
@zapier/ai-actions,0.1.18-0.1.20,npm,https://...
@ensdomains/ens-validation,0.1.1,npm,https://...
```

**Key Information**:
- **Package Name**: Scoped or unscoped npm package identifier
- **Version Range**: Either `x.y.z-x.y.z` (range) or `x.y.z` (single version)
- Stores in a Map data structure for O(1) lookup performance

### 2. **Recursive File Discovery**
```javascript
// Pseudocode flow
function findPackageJsonFiles(dir) {
  for each item in directory:
    if item is directory:
      if name is not .bin, .cache, etc:
        recursively search subdirectory
    else if item is "package.json":
      add to results
}
```

Efficiently traverses `node_modules` structure, finding all package manifests.

### 3. **Version Range Parsing**
Handles two formats:

**Range Format**: `2.1.2-2.1.4`
```javascript
{
  minVersion: "2.1.2",
  maxVersion: "2.1.4"
}
```

**Single Version**: `0.1.1`
```javascript
{
  minVersion: "0.1.1",
  maxVersion: "0.1.1"  // Same as min
}
```

### 4. **Semantic Version Comparison**
```javascript
// Example: Is version 2.1.3 compromised in range 2.1.2-2.1.4?

Step 1: Clean version (remove ^, ~, >=)
  "^2.1.3" → "2.1.3"

Step 2: Split into parts
  "2.1.3" → [2, 1, 3]

Step 3: Compare with range
  2.1.3 >= 2.1.2 ✓ (meets minimum)
  2.1.3 <= 2.1.4 ✓ (below maximum)
  
Result: COMPROMISED ⚠️
```

### 5. **Detection Logic Flow**
```
For each package.json found:
  1. Extract package name and version
  2. Check if name exists in compromised list
  3. If yes:
     a. Parse installed version
     b. Parse compromised range
     c. Compare using semantic versioning
     d. If match → Add to vulnerabilities
  4. Continue scanning
```

### 6. **Report Generation**
- **Console Output**: Human-readable summary with colored indicators
- **JSON Report**: Machine-readable data for automation
- **Exit Code**: 0 (safe) or 1 (vulnerable) for CI/CD integration

## Testing the Detection

### Test 1: Manual Scan
```bash
# From project root
node detect-compromised.js --scan angular-app
```

**Expected Output** (with compromised packages present):
```
⚠️  Compromised packages found: 2

🚨 CRITICAL VULNERABILITIES DETECTED:

1. @postman/secret-scanner-wasm@2.1.2
   Range: 2.1.2-2.1.4
   
2. @zapier/ai-actions@0.1.18
   Range: 0.1.18-0.1.20
```

### Test 2: Automated Protection (npm hooks)
```bash
cd angular-app
npm start
```

**Expected Behavior**:
1. `prestart` hook triggers security scan
2. Script detects compromised packages
3. Exits with code 1
4. `npm start` aborts - **app won't start**
5. Prevents running vulnerable code

### Test 3: Build Pipeline Protection
```bash
cd angular-app
npm run build
```

**Expected Behavior**:
1. `prebuild` hook triggers security scan
2. Detection fails with exit code 1
3. Build process aborts
4. Prevents deploying compromised code

### Test 4: CI/CD Integration
The exit codes enable automated pipeline failures:

```bash
node detect-compromised.js || exit 1
# Returns 1 if vulnerabilities found → pipeline fails
```

## Bypassing Detection (For Testing/Development)

Sometimes you need to run the app despite vulnerabilities (for POC demos, testing, etc.).

### Method 1: Skip npm Scripts (Recommended for POC)
```bash
cd angular-app
ng serve
# Bypasses package.json scripts and prestart hook
```

**Use Case**: Demonstrate the vulnerable app running, then show detection blocking it

### Method 2: Temporarily Disable Hooks
Edit `angular-app/package.json`:
```json
{
  "scripts": {
    "start": "ng serve",
    "start:safe": "npm run security:scan && ng serve",
    "security:scan": "node ../detect-compromised.js --scan ."
    // Removed: "prestart": "npm run security:scan"
  }
}
```

Now `npm start` runs without scanning. Use `npm run start:safe` when you want protection.

### Method 3: Use --ignore-scripts Flag
```bash
npm start --ignore-scripts
# Skips all npm lifecycle hooks including prestart
```

**Warning**: This also skips other important hooks, use cautiously.

### Method 4: Force Continue (Not Recommended)
Modify the detection script to always exit 0:
```javascript
// Temporary override for demo
process.exit(0); // Instead of process.exit(1)
```

**Important**: Revert this after testing!

## POC Demonstration Flow

### Scenario 1: Show Detection Working
```bash
# 1. Run manual scan
node detect-compromised.js --scan angular-app
# Shows: 2 compromised packages detected

# 2. Try to start app normally
cd angular-app
npm start
# Shows: Blocked by security scan

# 3. View detailed report
cat ../compromise-scan-report.json
```

### Scenario 2: Show Bypass for Development
```bash
# Developer needs to run app despite warnings
cd angular-app
ng serve
# App starts (bypassing hooks)

# But security team can still audit
npm run security:scan
# Manual scan still available
```

### Scenario 3: Show Remediation
```bash
# 1. Detect vulnerabilities
node detect-compromised.js --scan angular-app

# 2. Remove compromised packages
rm -rf angular-app/node_modules/@postman
rm -rf angular-app/node_modules/@zapier

# 3. Verify clean state
node detect-compromised.js --scan angular-app
# Shows: 0 compromised packages

# 4. App starts successfully
cd angular-app
npm start
# ✅ Security scan passed, app running
```

## CSV File Format

The script reads compromised package data from a CSV file with the following structure:

```csv
Package Name,Version Range,Ecosystem,Source URL
@postman/secret-scanner-wasm,2.1.2-2.1.4,npm,https://...
@ensdomains/ens-validation,0.1.1,npm,https://...
```

**Important columns:**
- **Column 1**: Package Name (e.g., `@postman/secret-scanner-wasm`)
- **Column 2**: Version Range (e.g., `2.1.2-2.1.4` or single version `0.1.1`)

## Installation

No additional dependencies required - uses Node.js built-in modules only.

```bash
# Ensure you have Node.js installed
node --version
```

## Usage

### Basic Usage

Run from the project root directory:

```bash
node detect-compromised.js
```

This will:
1. Load the CSV from default path: `./angular-app/src/app/compromise/sha1_hulud_full.csv`
2. Scan current directory's `node_modules`
3. Generate `compromise-scan-report.json`

### Advanced Usage

```bash
# Scan a specific directory
node detect-compromised.js --scan /path/to/your/project

# Use a custom CSV file
node detect-compromised.js --csv /path/to/compromised-packages.csv

# Custom output location
node detect-compromised.js --output /path/to/results.json

# Combine options
node detect-compromised.js --csv custom.csv --scan ../my-project --output scan-results.json
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--csv <path>` | Path to CSV file with compromised packages | `./angular-app/src/app/compromise/sha1_hulud_full.csv` |
| `--scan <path>` | Path to directory to scan for node_modules | Current directory |
| `--output <path>` | Output path for JSON report | `compromise-scan-report.json` |
| `--help`, `-h` | Show help message | - |

## Output

### Console Output

```
🔍 Starting SHA-1 HULUD Compromised Package Scan...

📂 Scan Path: C:\Users\...\angular_poc
📋 CSV Path: ...\sha1_hulud_full.csv

✓ Loaded 48 compromised package entries

🔎 Searching for package.json files in node_modules...
✓ Found 1234 package.json files

🔬 Scanning packages...
  Progress: 1234/1234 packages scanned

======================================================================
                    SCAN SUMMARY
======================================================================

📊 Total packages scanned:     1234
📦 Unique packages:            567
⚠️  Compromised packages found: 1

🚨 CRITICAL VULNERABILITIES DETECTED:

1. @postman/secret-scanner-wasm@2.1.2
   Range: 2.1.2-2.1.4
   Location: ...\node_modules\@postman\secret-scanner-wasm\package.json
   Severity: CRITICAL
   Remove immediately and check for malicious activity

⚠️  ACTION REQUIRED: Remove compromised packages immediately!

======================================================================

💾 Full report saved to: compromise-scan-report.json
```

### JSON Report Structure

```json
{
  "scan": {
    "scanPath": "/path/to/project",
    "csvPath": "/path/to/csv",
    "startTime": "2025-11-26T05:30:00.000Z",
    "endTime": "2025-11-26T05:30:05.000Z",
    "duration": 5000
  },
  "summary": {
    "totalPackagesScanned": 1234,
    "totalUniquePackages": 567,
    "compromisedPackagesFound": 1,
    "status": "VULNERABLE"
  },
  "vulnerabilities": [
    {
      "packageName": "@postman/secret-scanner-wasm",
      "installedVersion": "2.1.2",
      "compromisedRange": "2.1.2-2.1.4",
      "location": "..\\node_modules\\@postman\\secret-scanner-wasm\\package.json",
      "severity": "CRITICAL",
      "incident": "SHA-1 HULUD npm supply chain incident (Nov 2025)",
      "recommendation": "Remove immediately and check for malicious activity"
    }
  ],
  "scannedPackages": [
    {
      "name": "@angular/animations",
      "version": "19.2.0",
      "path": "..\\node_modules\\@angular\\animations\\package.json"
    }
    // ... more packages
  ]
}
```

## Exit Codes

- `0`: No compromised packages found (safe)
- `1`: Compromised packages detected or error occurred

This allows integration into CI/CD pipelines:

```bash
node detect-compromised.js || exit 1
```

## How It Works

### 1. CSV Parsing
- Reads the CSV file and extracts package names and version ranges
- Stores in a Map for O(1) lookup during scanning

### 2. Version Range Parsing
- Handles ranges: `1.0.0-1.0.2` (min-max inclusive)
- Handles single versions: `0.1.1` (exact match)

### 3. Recursive Scanning
- Traverses all subdirectories in `node_modules`
- Finds every `package.json` file
- Skips `.bin` and `.cache` directories for performance

### 4. Version Comparison
- Implements semantic version comparison (x.y.z)
- Removes version prefixes (^, ~, >=, etc.)
- Checks if installed version falls within compromised range

### 5. Report Generation
- Creates detailed JSON report with all findings
- Displays human-readable console summary
- Provides actionable recommendations

## Example Scenarios

### Scenario 1: Clean Project
```bash
$ node detect-compromised.js
✓ Loaded 48 compromised package entries
✓ Found 1234 package.json files
📊 Total packages scanned: 1234
⚠️  Compromised packages found: 0
✅ No compromised packages detected
$ echo $?
0
```

### Scenario 2: Compromised Package Found
```bash
$ node detect-compromised.js
✓ Loaded 48 compromised package entries
✓ Found 1234 package.json files
🚨 CRITICAL VULNERABILITIES DETECTED:
1. @postman/secret-scanner-wasm@2.1.2
   Remove immediately and check for malicious activity
$ echo $?
1
```

## Integration with CI/CD

### GitHub Actions
```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  scan-compromised-packages:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Scan for compromised packages
        run: node detect-compromised.js --scan .
      
      - name: Upload scan report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: compromise-scan-report
          path: compromise-scan-report.json
      
      - name: Comment on PR (if vulnerabilities found)
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('compromise-scan-report.json', 'utf8'));
            const comment = `## 🚨 Security Alert: Compromised Packages Detected\n\n` +
              `Found ${report.summary.compromisedPackagesFound} compromised package(s):\n\n` +
              report.vulnerabilities.map(v => 
                `- **${v.packageName}@${v.installedVersion}** (Range: ${v.compromisedRange})`
              ).join('\n');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### GitLab CI
```yaml
stages:
  - security
  - build
  - test

security_scan:
  stage: security
  image: node:20
  before_script:
    - npm ci
  script:
    - node detect-compromised.js --scan .
  artifacts:
    paths:
      - compromise-scan-report.json
    when: always
    reports:
      junit: compromise-scan-report.json
  allow_failure: false  # Fail pipeline if vulnerabilities found

build:
  stage: build
  needs: [security_scan]
  script:
    - npm run build
  only:
    - merge_requests
    - main
```

### Bitbucket Pipelines
```yaml
image: node:20

pipelines:
  default:
    - step:
        name: Security Scan - Compromised Packages
        caches:
          - node
        script:
          - npm ci
          - node detect-compromised.js --scan .
        artifacts:
          - compromise-scan-report.json
  
  pull-requests:
    '**':
      - step:
          name: Security Scan - Compromised Packages
          caches:
            - node
          script:
            - npm ci
            - node detect-compromised.js --scan .
            - |
              if [ $? -eq 1 ]; then
                echo "⚠️ CRITICAL: Compromised packages detected!"
                echo "Review compromise-scan-report.json for details"
                exit 1
              fi
          artifacts:
            - compromise-scan-report.json
      
      - step:
          name: Build Application
          script:
            - npm run build
      
      - step:
          name: Run Tests
          script:
            - npm test

  branches:
    main:
      - step:
          name: Security Scan - Compromised Packages
          caches:
            - node
          script:
            - npm ci
            - node detect-compromised.js --scan .
          artifacts:
            - compromise-scan-report.json
          after-script:
            - |
              # Send notification if compromised packages found
              if [ -f compromise-scan-report.json ]; then
                VULN_COUNT=$(jq '.summary.compromisedPackagesFound' compromise-scan-report.json)
                if [ "$VULN_COUNT" -gt 0 ]; then
                  echo "Sending security alert notification..."
                  # Add your notification logic here (email, Slack, etc.)
                fi
              fi
      
      - step:
          name: Build and Deploy
          deployment: production
          script:
            - npm run build
            - npm run deploy
```

### Azure DevOps
```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Security
    displayName: 'Security Scan'
    jobs:
      - job: ScanCompromisedPackages
        displayName: 'Scan for Compromised Packages'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
            displayName: 'Install Node.js'
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: node detect-compromised.js --scan .
            displayName: 'Run compromised package detection'
            continueOnError: false
          
          - task: PublishBuildArtifacts@1
            condition: always()
            inputs:
              PathtoPublish: 'compromise-scan-report.json'
              ArtifactName: 'security-scan-report'
            displayName: 'Publish scan report'
          
          - task: PublishTestResults@2
            condition: always()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'compromise-scan-report.json'
              failTaskOnFailedTests: true
            displayName: 'Publish security results'

  - stage: Build
    displayName: 'Build Application'
    dependsOn: Security
    jobs:
      - job: BuildApp
        steps:
          - script: npm run build
            displayName: 'Build application'
```

### Jenkins
```groovy
pipeline {
    agent any
    
    stages {
        stage('Security Scan') {
            steps {
                script {
                    sh 'npm ci'
                    
                    // Run the compromised package detector
                    def scanResult = sh(
                        script: 'node detect-compromised.js --scan .',
                        returnStatus: true
                    )
                    
                    // Archive the report
                    archiveArtifacts artifacts: 'compromise-scan-report.json', 
                                   allowEmptyArchive: false
                    
                    // Fail build if vulnerabilities found
                    if (scanResult != 0) {
                        def report = readJSON file: 'compromise-scan-report.json'
                        def vulnCount = report.summary.compromisedPackagesFound
                        
                        error("🚨 CRITICAL: Found ${vulnCount} compromised package(s)! " +
                              "Review compromise-scan-report.json for details.")
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'compromise-scan-report.json',
                reportName: 'Compromised Package Scan Report'
            ])
        }
        
        failure {
            emailext(
                subject: "Security Alert: Compromised Packages in ${env.JOB_NAME}",
                body: "Build ${env.BUILD_NUMBER} detected compromised packages. " +
                      "Review the scan report for details.",
                to: 'security-team@example.com'
            )
        }
    }
}
```

### CircleCI
```yaml
version: 2.1

jobs:
  security-scan:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - deps-{{ checksum "package-lock.json" }}
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          key: deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      - run:
          name: Scan for compromised packages
          command: node detect-compromised.js --scan .
      - store_artifacts:
          path: compromise-scan-report.json
          destination: security-reports
      - run:
          name: Parse scan results
          when: always
          command: |
            if [ -f compromise-scan-report.json ]; then
              VULN_COUNT=$(jq '.summary.compromisedPackagesFound' compromise-scan-report.json)
              echo "Compromised packages found: $VULN_COUNT"
              if [ "$VULN_COUNT" -gt 0 ]; then
                exit 1
              fi
            fi

  build:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: npm ci
      - run: npm run build

workflows:
  version: 2
  security-and-build:
    jobs:
      - security-scan
      - build:
          requires:
            - security-scan
```

### CI/CD Best Practices

1. **Run Early in Pipeline**: Execute security scan as the first step to fail fast
2. **Block Deployments**: Set `allow_failure: false` or equivalent to prevent vulnerable code from reaching production
3. **Archive Reports**: Always save `compromise-scan-report.json` as an artifact for audit trails
4. **Notifications**: Configure alerts (email, Slack, Teams) when vulnerabilities are detected
5. **PR Comments**: Automatically comment on pull requests with security findings
6. **Cache Dependencies**: Cache `node_modules` to speed up CI runs
7. **Scheduled Scans**: Run periodic scans on main branches to catch newly published vulnerability data
8. **Dependency Installation**: Always run `npm ci` (not `npm install`) for consistent, reproducible builds

## Performance

- Scans ~1000 packages in ~3-5 seconds
- Memory efficient (streams files, doesn't load all at once)
- No external dependencies required

## Troubleshooting

### "No node_modules directory found"
- Ensure you run the script in a directory containing `node_modules`
- Or use `--scan` to specify the correct path

### "Error loading CSV file"
- Verify the CSV path is correct
- Check file permissions
- Ensure CSV format matches expected structure

### Permission errors during scan
- The script silently skips directories it can't read
- Check file system permissions if concerned

## Security Recommendations

If compromised packages are detected:

1. **Immediately remove** the compromised packages
2. **Audit your code** for any suspicious activity
3. **Check environment variables** and secrets
4. **Review git history** for unauthorized commits
5. **Rotate credentials** that may have been exposed
6. **Update to safe versions** of the packages
7. **Report the incident** to your security team

## License

This script is provided as-is for detecting the SHA-1 HULUD supply chain incident.

## References

- [Snyk Security Advisory](https://security.snyk.io/sha1-hulud-npm-supply-chain-incident-nov-2025)
- [npm Blog on Supply Chain Security](https://blog.npmjs.org/)
