# SHA-1 HULUD Detection POC & Angular E-Commerce Demo

This project serves as a comprehensive **Proof of Concept (POC)** demonstrating security vulnerability detection in npm packages, specifically targeting the SHA-1 HULUD supply chain incident (November 2025). It combines a fully functional Angular e-commerce application with an automated security scanning solution to showcase real-world detection and prevention of compromised dependencies.

## Project Overview

This repository contains two main components:

1. **Compromised Package Detector** - A Node.js security scanner
2. **Angular E-Commerce Application** - A demo vegetable store with integrated security

## 📋 Components

### 1. Security Detection System

**📄 [DETECTOR-README.md](./DETECTOR-README.md)**

The detection system provides automated scanning capabilities to identify compromised npm packages from the SHA-1 HULUD supply chain incident. This tool recursively scans `node_modules` directories, comparing installed package versions against a curated CSV database of 48 known compromised packages. It implements semantic version comparison to detect vulnerable ranges (e.g., `2.1.2-2.1.4`) and generates both human-readable console output and machine-readable JSON reports. The scanner integrates seamlessly into development workflows through npm lifecycle hooks (`prestart`, `prebuild`) and CI/CD pipelines (GitHub Actions, GitLab CI, Bitbucket Pipelines, Azure DevOps, Jenkins, CircleCI), blocking application startup and deployment when vulnerabilities are detected. With zero external dependencies and sub-second scan times for typical projects, it demonstrates practical supply chain security defense that can be adopted across any npm-based project regardless of framework (Angular, React, Node.js, etc.).

### 2. Angular E-Commerce Application

**📄 [angular-app/ECOMMERCE-README.md](./angular-app/ECOMMERCE-README.md)**

The e-commerce component is a fully functional Angular 19 TypeScript application showcasing a vegetable store with South African Rand (ZAR) pricing. Built with standalone components and reactive state management using RxJS, the application features a complete shopping experience including product browsing, cart management with quantity controls, and a checkout flow with multiple payment options (Card, EFT, Cash, SnapScan, Zapper). The store offers 8 different vegetables with professional imagery, real-time cart badge updates, and responsive design with a vegetable-themed color scheme. This application serves as the test bed for demonstrating the security detection system, showing how automated scanning can prevent vulnerable code from running in production while maintaining full development functionality through bypass mechanisms for testing and demonstration purposes.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Angular CLI 19.x

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd angular_poc

# Install Angular app dependencies
cd angular-app
npm install

# Return to project root
cd ..
```

### Running the Security Scan

```bash
# From project root
node detect-compromised.js --scan angular-app

# Expected output (with simulated compromised packages):
# ⚠️  Compromised packages found: 2
# 🚨 CRITICAL VULNERABILITIES DETECTED
```

### Running the E-Commerce App

**Option 1: With Security Protection (npm hooks)**
```bash
cd angular-app
npm start
# Will run security scan first, blocks if vulnerabilities found
```

**Option 2: Bypass Security (for demo/testing)**
```bash
cd angular-app
ng serve
# Directly runs Angular dev server, bypasses security hooks
```

Visit `http://localhost:4200/` to view the application.

## 📊 Project Structure

```
angular_poc/
├── README.md                           # This file
├── DETECTOR-README.md                  # Security detector documentation
├── detect-compromised.js               # Main detection script
├── compromise-scan-report.json         # Generated scan report (JSON)
│
├── angular-app/                        # Angular e-commerce application
│   ├── ECOMMERCE-README.md            # E-commerce app documentation
│   ├── package.json                    # Dependencies with security hooks
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── product-list/      # Product catalog
│   │   │   │   ├── cart/              # Shopping cart
│   │   │   │   └── checkout/          # Checkout flow
│   │   │   ├── services/
│   │   │   │   ├── product.service.ts # Product data
│   │   │   │   └── cart.service.ts    # Cart state management
│   │   │   ├── models/
│   │   │   │   └── product.ts         # TypeScript interfaces
│   │   │   └── compromise/
│   │   │       └── sha1_hulud_full.csv # Compromised packages database
│   │   └── ...
│   └── node_modules/                   # Dependencies (scanned by detector)
│       ├── @postman/                   # Simulated compromised packages
│       └── @zapier/                    # (for POC demonstration)
```

## 🔒 Security Features

- ✅ **Automated Detection**: Scans all installed npm packages recursively
- ✅ **Semantic Versioning**: Accurately matches version ranges (e.g., 2.1.2-2.1.4)
- ✅ **Pre-execution Hooks**: Prevents app startup when vulnerabilities detected
- ✅ **CI/CD Integration**: Blocks deployments in automated pipelines
- ✅ **Zero Dependencies**: No external packages required for detection
- ✅ **JSON Reporting**: Machine-readable output for automation
- ✅ **Exit Codes**: Proper status codes for pipeline integration (0=safe, 1=vulnerable)

## 🎯 Use Cases

### 1. Development Protection
```bash
# Developer tries to start app with vulnerable dependencies
npm start
# ❌ Blocked: Security scan fails, app won't start
```

### 2. CI/CD Pipeline
```yaml
# Bitbucket Pipelines example
- step:
    name: Security Scan
    script:
      - node detect-compromised.js --scan .
      # Pipeline fails if exit code 1
```

### 3. Manual Auditing
```bash
# Security team runs scan across multiple projects
node detect-compromised.js --scan /path/to/projects
# Generates detailed JSON report for review
```

### 4. POC Demonstration
```bash
# Show detection working
node detect-compromised.js --scan angular-app

# Show blocking mechanism
npm start  # Fails due to prestart hook

# Show bypass for testing
ng serve   # Runs without security check
```

## 📚 Documentation

- **[DETECTOR-README.md](./DETECTOR-README.md)** - Complete security scanner documentation
  - How detection works
  - Testing procedures
  - Bypass methods
  - CI/CD integration (GitHub, GitLab, Bitbucket, Azure, Jenkins, CircleCI)
  - API reference
  
- **[angular-app/ECOMMERCE-README.md](./angular-app/ECOMMERCE-README.md)** - E-commerce application guide
  - Application features
  - Component architecture
  - Running the app
  - Development workflow

## 🛠️ Technology Stack

**Detection System:**
- Node.js (built-in modules only)
- CSV parsing
- File system traversal
- Semantic version comparison

**E-Commerce App:**
- Angular 19.2.0
- TypeScript 5.7.3
- RxJS 7.8.2 (reactive state)
- Standalone Components
- Server-Side Rendering (SSR)

## 🔄 CI/CD Integration

The security detector integrates seamlessly into CI/CD pipelines to prevent compromised packages from reaching production. Full examples available in [DETECTOR-README.md](./DETECTOR-README.md#integration-with-cicd).

### Bitbucket Pipelines (Recommended)

Create `bitbucket-pipelines.yml` in your repository root:

```yaml
image: node:20

definitions:
  caches:
    npm: ~/.npm

pipelines:
  default:
    - step:
        name: Security Scan - SHA-1 HULUD Detection
        caches:
          - npm
        script:
          - cd angular-app
          - npm ci
          - cd ..
          - node detect-compromised.js --scan angular-app
          - |
            if [ $? -eq 1 ]; then
              echo "⚠️ CRITICAL: Compromised packages detected!"
              echo "Review compromise-scan-report.json for details"
              exit 1
            fi
        artifacts:
          - compromise-scan-report.json

  pull-requests:
    '**':
      - parallel:
          - step:
              name: Security Scan
              caches:
                - npm
              script:
                - cd angular-app && npm ci && cd ..
                - node detect-compromised.js --scan angular-app
              artifacts:
                - compromise-scan-report.json
          
          - step:
              name: Lint & Type Check
              script:
                - cd angular-app && npm ci
                - npm run lint
      
      - step:
          name: Build Application
          script:
            - cd angular-app
            - npm run build
      
      - step:
          name: Run Tests
          script:
            - cd angular-app
            - npm test

  branches:
    main:
      - step:
          name: Security Scan - Production
          caches:
            - npm
          script:
            - cd angular-app && npm ci && cd ..
            - node detect-compromised.js --scan angular-app
            - |
              # Parse scan results
              VULN_COUNT=$(cat compromise-scan-report.json | grep -o '"compromisedPackagesFound":[0-9]*' | grep -o '[0-9]*')
              echo "Vulnerabilities found: $VULN_COUNT"
              
              if [ "$VULN_COUNT" -gt 0 ]; then
                echo "🚨 Blocking production deployment due to security vulnerabilities"
                exit 1
              fi
          artifacts:
            - compromise-scan-report.json
      
      - step:
          name: Build Production
          script:
            - cd angular-app
            - npm run build --configuration production
      
      - step:
          name: Deploy to Production
          deployment: production
          script:
            - echo "Deploying to production..."
            # Add your deployment commands here
```

### Key Bitbucket Features

**1. Parallel Steps for Speed**
```yaml
- parallel:
    - step:
        name: Security Scan
    - step:
        name: Lint
```
Run security scan and linting simultaneously to reduce pipeline time.

**2. Branch-Specific Workflows**
- `default`: Basic scan for all branches
- `pull-requests`: Comprehensive checks before merge
- `main`: Production-grade security with deployment gates

**3. Artifact Preservation**
```yaml
artifacts:
  - compromise-scan-report.json
```
Reports persist for 14 days by default, available for download and audit.

**4. Exit Code Enforcement**
The detector returns exit code 1 when vulnerabilities are found, automatically failing the pipeline step.

**5. Deployment Protection**
```yaml
deployment: production
```
Only reaches this step if all security scans pass.

### Other CI/CD Platforms

- **GitHub Actions**: See [DETECTOR-README.md](./DETECTOR-README.md#github-actions)
- **GitLab CI**: See [DETECTOR-README.md](./DETECTOR-README.md#gitlab-ci)
- **Azure DevOps**: See [DETECTOR-README.md](./DETECTOR-README.md#azure-devops)
- **Jenkins**: See [DETECTOR-README.md](./DETECTOR-README.md#jenkins)
- **CircleCI**: See [DETECTOR-README.md](./DETECTOR-README.md#circleci)

## 🧪 Testing the POC

### Test 1: Verify Detection
```bash
# Scan should find 2 compromised packages
node detect-compromised.js --scan angular-app
```

### Test 2: Verify Blocking
```bash
# Should fail with security scan error
cd angular-app
npm start
```

### Test 3: Verify Remediation
```bash
# Remove compromised packages
cd angular-app
rm -rf node_modules/@postman node_modules/@zapier

# Re-scan should show clean
cd ..
node detect-compromised.js --scan angular-app

# App should start successfully
cd angular-app
npm start
```

### Test 4: CI/CD Simulation
```bash
# Simulate what happens in Bitbucket Pipelines
cd angular-app
npm ci  # Clean install (like CI environment)
cd ..
node detect-compromised.js --scan angular-app
echo "Exit code: $?"  # Should be 1 if vulnerabilities found
```

## 🤝 Contributing

This is a POC project demonstrating security vulnerability detection. For production use:

1. Update the CSV with current vulnerability data
2. Integrate with vulnerability databases (Snyk, npm audit, etc.)
3. Add email/Slack notifications
4. Implement automated remediation suggestions
5. Add historical tracking and trending

## 📄 License

This POC is provided as-is for educational and demonstration purposes.

## 🔗 References

- [SHA-1 HULUD Incident Report](https://security.snyk.io/sha1-hulud-npm-supply-chain-incident-nov-2025)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Angular Security Guide](https://angular.dev/best-practices/security)
- [Supply Chain Security Framework](https://slsa.dev/)

## 📧 Support

For questions or issues with this POC:
- Review the DETECTOR-README.md for security scanner details
- Review the ECOMMERCE-README.md for application-specific guidance
- Check the compromise-scan-report.json for scan results

---

**⚠️ Security Notice**: This project contains simulated compromised packages for demonstration purposes. In production environments, never intentionally install known vulnerable packages.
