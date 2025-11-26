#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * SHA-1 HULUD Compromised Package Detector
 * Scans node_modules for compromised packages from the November 2025 supply chain incident
 */

class CompromisedPackageDetector {
  constructor(csvPath, scanPath) {
    this.csvPath = csvPath;
    this.scanPath = scanPath || process.cwd();
    this.compromisedPackages = new Map();
    this.scannedPackages = [];
    this.detectedVulnerabilities = [];
    this.stats = {
      totalPackagesScanned: 0,
      totalCompromisedFound: 0,
      totalUnique: 0,
      scanStartTime: null,
      scanEndTime: null
    };
  }

  /**
   * Load and parse the CSV file containing compromised package data
   */
  loadCompromisedPackages() {
    try {
      const csvContent = fs.readFileSync(this.csvPath, 'utf-8');
      const lines = csvContent.split('\n').slice(1); // Skip header

      lines.forEach(line => {
        if (!line.trim()) return;
        
        const [packageName, versionRange] = line.split(',').map(s => s.trim());
        
        if (packageName && versionRange) {
          this.compromisedPackages.set(packageName, versionRange);
        }
      });

      console.log(`✓ Loaded ${this.compromisedPackages.size} compromised package entries`);
      return true;
    } catch (error) {
      console.error(`✗ Error loading CSV file: ${error.message}`);
      return false;
    }
  }

  /**
   * Parse version range from CSV (e.g., "1.0.0-1.0.2" or "0.1.1")
   */
  parseVersionRange(rangeString) {
    if (rangeString.includes('-')) {
      const [min, max] = rangeString.split('-').map(v => v.trim());
      return { min, max, isSingle: false };
    }
    return { min: rangeString, max: rangeString, isSingle: true };
  }

  /**
   * Compare semantic versions (supports x.y.z format)
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    return 0;
  }

  /**
   * Check if a version falls within a compromised range
   */
  isVersionCompromised(installedVersion, rangeString) {
    // Remove any version prefixes (^, ~, >=, etc.)
    const cleanVersion = installedVersion.replace(/^[\^~>=<]+/, '');
    
    const range = this.parseVersionRange(rangeString);
    
    // For single version, exact match
    if (range.isSingle) {
      return this.compareVersions(cleanVersion, range.min) === 0;
    }
    
    // For range, check if version is between min and max (inclusive)
    const minCheck = this.compareVersions(cleanVersion, range.min);
    const maxCheck = this.compareVersions(cleanVersion, range.max);
    
    return minCheck >= 0 && maxCheck <= 0;
  }

  /**
   * Recursively find all package.json files in node_modules
   */
  findPackageJsonFiles(dir, files = []) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip certain directories for performance
          if (entry.name === '.bin' || entry.name === '.cache') continue;
          
          this.findPackageJsonFiles(fullPath, files);
        } else if (entry.name === 'package.json') {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Silently skip directories we can't read (permissions, etc.)
    }
    
    return files;
  }

  /**
   * Scan a single package.json file
   */
  scanPackageJson(packageJsonPath) {
    try {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageData = JSON.parse(content);
      
      const packageName = packageData.name;
      const packageVersion = packageData.version;
      
      if (!packageName || !packageVersion) return null;
      
      this.stats.totalPackagesScanned++;
      
      const scannedPackage = {
        name: packageName,
        version: packageVersion,
        path: packageJsonPath
      };
      
      this.scannedPackages.push(scannedPackage);
      
      // Check if this package is in the compromised list
      if (this.compromisedPackages.has(packageName)) {
        const compromisedRange = this.compromisedPackages.get(packageName);
        
        if (this.isVersionCompromised(packageVersion, compromisedRange)) {
          const vulnerability = {
            packageName,
            installedVersion: packageVersion,
            compromisedRange,
            location: packageJsonPath,
            severity: 'CRITICAL',
            incident: 'SHA-1 HULUD npm supply chain incident (Nov 2025)',
            recommendation: 'Remove immediately and check for malicious activity'
          };
          
          this.detectedVulnerabilities.push(vulnerability);
          this.stats.totalCompromisedFound++;
          
          return vulnerability;
        }
      }
      
      return null;
    } catch (error) {
      // Skip invalid package.json files
      return null;
    }
  }

  /**
   * Main scan function
   */
  async scan() {
    console.log('\n🔍 Starting SHA-1 HULUD Compromised Package Scan...\n');
    console.log(`📂 Scan Path: ${this.scanPath}`);
    console.log(`📋 CSV Path: ${this.csvPath}\n`);
    
    this.stats.scanStartTime = new Date().toISOString();
    
    // Load compromised package data
    if (!this.loadCompromisedPackages()) {
      return this.generateReport();
    }
    
    // Find all package.json files
    console.log('\n🔎 Searching for package.json files in node_modules...');
    const nodeModulesPath = path.join(this.scanPath, 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('⚠ No node_modules directory found');
      this.stats.scanEndTime = new Date().toISOString();
      return this.generateReport();
    }
    
    const packageJsonFiles = this.findPackageJsonFiles(nodeModulesPath);
    console.log(`✓ Found ${packageJsonFiles.length} package.json files\n`);
    
    // Scan each package
    console.log('🔬 Scanning packages...\n');
    let progress = 0;
    const total = packageJsonFiles.length;
    
    for (const pkgPath of packageJsonFiles) {
      this.scanPackageJson(pkgPath);
      progress++;
      
      // Show progress every 100 packages
      if (progress % 100 === 0 || progress === total) {
        process.stdout.write(`\r  Progress: ${progress}/${total} packages scanned`);
      }
    }
    
    console.log('\n');
    this.stats.scanEndTime = new Date().toISOString();
    
    // Calculate unique packages
    const uniqueNames = new Set(this.scannedPackages.map(p => p.name));
    this.stats.totalUnique = uniqueNames.size;
    
    return this.generateReport();
  }

  /**
   * Generate machine-readable JSON report
   */
  generateReport() {
    const report = {
      scan: {
        scanPath: this.scanPath,
        csvPath: this.csvPath,
        startTime: this.stats.scanStartTime,
        endTime: this.stats.scanEndTime,
        duration: this.stats.scanEndTime && this.stats.scanStartTime
          ? new Date(this.stats.scanEndTime) - new Date(this.stats.scanStartTime)
          : null
      },
      summary: {
        totalPackagesScanned: this.stats.totalPackagesScanned,
        totalUniquePackages: this.stats.totalUnique,
        compromisedPackagesFound: this.stats.totalCompromisedFound,
        status: this.stats.totalCompromisedFound > 0 ? 'VULNERABLE' : 'SAFE'
      },
      vulnerabilities: this.detectedVulnerabilities,
      scannedPackages: this.scannedPackages
    };
    
    // Display console summary
    this.displayConsoleSummary(report);
    
    return report;
  }

  /**
   * Display human-readable summary in console
   */
  displayConsoleSummary(report) {
    console.log('\n' + '='.repeat(70));
    console.log('                    SCAN SUMMARY');
    console.log('='.repeat(70) + '\n');
    
    console.log(`📊 Total packages scanned:     ${report.summary.totalPackagesScanned}`);
    console.log(`📦 Unique packages:            ${report.summary.totalUniquePackages}`);
    console.log(`⚠️  Compromised packages found: ${report.summary.compromisedPackagesFound}\n`);
    
    if (report.summary.compromisedPackagesFound > 0) {
      console.log('🚨 CRITICAL VULNERABILITIES DETECTED:\n');
      
      report.vulnerabilities.forEach((vuln, index) => {
        console.log(`${index + 1}. ${vuln.packageName}@${vuln.installedVersion}`);
        console.log(`   Range: ${vuln.compromisedRange}`);
        console.log(`   Location: ${vuln.location}`);
        console.log(`   Severity: ${vuln.severity}`);
        console.log(`   ${vuln.recommendation}\n`);
      });
      
      console.log('⚠️  ACTION REQUIRED: Remove compromised packages immediately!\n');
    } else {
      console.log('✅ No compromised packages detected\n');
    }
    
    console.log('='.repeat(70) + '\n');
  }

  /**
   * Validate and sanitize output path to prevent path traversal attacks
   */
  sanitizeOutputPath(outputPath) {
    // Get absolute path and resolve any relative path components
    const resolvedPath = path.resolve(outputPath);
    
    // Get the current working directory
    const cwd = process.cwd();
    
    // Ensure the resolved path is within the current working directory
    if (!resolvedPath.startsWith(cwd)) {
      throw new Error('Invalid output path: Path traversal attempt detected. Output must be within current directory.');
    }
    
    // Ensure filename has .json extension
    if (!resolvedPath.endsWith('.json')) {
      throw new Error('Invalid output path: Output file must have .json extension.');
    }
    
    // Check for suspicious path characters
    const filename = path.basename(outputPath);
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid output path: Filename contains suspicious characters.');
    }
    
    return resolvedPath;
  }

  /**
   * Save report to JSON file
   */
  saveReport(report, outputPath = 'compromise-scan-report.json') {
    try {
      // Sanitize output path to prevent path traversal
      const safePath = this.sanitizeOutputPath(outputPath);
      
      fs.writeFileSync(safePath, JSON.stringify(report, null, 2));
      console.log(`💾 Full report saved to: ${safePath}\n`);
      return true;
    } catch (error) {
      console.error(`✗ Error saving report: ${error.message}`);
      return false;
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  let csvPath = path.join(__dirname, 'angular-app', 'src', 'app', 'compromise', 'sha1_hulud_full.csv');
  let scanPath = process.cwd();
  let outputPath = 'compromise-scan-report.json';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--csv' && args[i + 1]) {
      csvPath = args[i + 1];
      i++;
    } else if (args[i] === '--scan' && args[i + 1]) {
      scanPath = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
SHA-1 HULUD Compromised Package Detector

Usage: node detect-compromised.js [options]

Options:
  --csv <path>      Path to CSV file with compromised packages
                    Default: ./angular-app/src/app/compromise/sha1_hulud_full.csv
  
  --scan <path>     Path to scan for node_modules
                    Default: current directory
  
  --output <path>   Output path for JSON report
                    Default: compromise-scan-report.json
  
  --help, -h        Show this help message

Examples:
  node detect-compromised.js
  node detect-compromised.js --scan /path/to/project
  node detect-compromised.js --csv custom.csv --output results.json
      `);
      process.exit(0);
    }
  }
  
  const detector = new CompromisedPackageDetector(csvPath, scanPath);
  const report = await detector.scan();
  detector.saveReport(report, outputPath);
  
  // Exit with error code if vulnerabilities found
  process.exit(report.summary.compromisedPackagesFound > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = CompromisedPackageDetector;
