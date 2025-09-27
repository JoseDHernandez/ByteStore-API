#!/usr/bin/env node

const newman = require('newman');
const path = require('path');
const fs = require('fs');

// Configuración de colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración de archivos
const config = {
    collection: path.join(__dirname, 'ByteStore-API-Tests.postman_collection.json'),
    environment: path.join(__dirname, 'ByteStore-API-Environment.postman_environment.json'),
    outputDir: path.join(__dirname, 'test-results'),
    htmlReport: path.join(__dirname, 'test-results', 'api-test-report.html'),
    jsonReport: path.join(__dirname, 'test-results', 'api-test-results.json'),
    junitReport: path.join(__dirname, 'test-results', 'api-test-results.xml')
};

// Crear directorio de resultados si no existe
if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
}

// Verificar que los archivos existan
function checkFiles() {
    const files = [
        { path: config.collection, name: 'Colección de Postman' },
        { path: config.environment, name: 'Entorno de Postman' }
    ];

    for (const file of files) {
        if (!fs.existsSync(file.path)) {
            log(`❌ Error: No se encontró ${file.name} en: ${file.path}`, 'red');
            process.exit(1);
        }
    }
    log('✅ Archivos de configuración encontrados', 'green');
}

// Función para ejecutar las pruebas
function runTests(options = {}) {
    const defaultOptions = {
        collection: config.collection,
        environment: config.environment,
        reporters: ['cli', 'json'],
        reporter: {
            json: {
                export: config.jsonReport
            }
        },
        iterationCount: 1,
        delayRequest: 500, // 500ms entre requests
        timeout: 30000, // 30 segundos timeout
        timeoutRequest: 10000, // 10 segundos timeout por request
        bail: false, // No parar en el primer error
        color: 'on',
        verbose: true
    };

    const finalOptions = { ...defaultOptions, ...options };

    log('🚀 Iniciando pruebas de API...', 'cyan');
    log(`📁 Colección: ${path.basename(config.collection)}`, 'blue');
    log(`🌍 Entorno: ${path.basename(config.environment)}`, 'blue');
    log(`📊 Reportes: ${config.outputDir}`, 'blue');
    log('', 'reset');

    return new Promise((resolve, reject) => {
        newman.run(finalOptions, (err, summary) => {
            if (err) {
                log('❌ Error ejecutando las pruebas:', 'red');
                console.error(err);
                reject(err);
                return;
            }

            // Mostrar resumen de resultados
            displaySummary(summary);
            
            // Generar reporte personalizado
            generateCustomReport(summary);
            
            resolve(summary);
        });
    });
}

// Mostrar resumen de resultados
function displaySummary(summary) {
    log('\n📊 RESUMEN DE PRUEBAS', 'bright');
    log('='.repeat(50), 'cyan');
    
    const stats = summary.run.stats;
    const timings = summary.run.timings;
    
    log(`📝 Total de requests: ${stats.requests.total}`, 'blue');
    log(`✅ Requests exitosos: ${stats.requests.total - stats.requests.failed}`, 'green');
    log(`❌ Requests fallidos: ${stats.requests.failed}`, stats.requests.failed > 0 ? 'red' : 'green');
    log(`🧪 Total de tests: ${stats.tests.total}`, 'blue');
    log(`✅ Tests pasados: ${stats.tests.passed}`, 'green');
    log(`❌ Tests fallidos: ${stats.tests.failed}`, stats.tests.failed > 0 ? 'red' : 'green');
    log(`⏱️  Tiempo total: ${Math.round(timings.completed - timings.started)}ms`, 'yellow');
    
    // Mostrar tasa de éxito
    const successRate = ((stats.tests.passed / stats.tests.total) * 100).toFixed(2);
    const color = successRate >= 95 ? 'green' : successRate >= 80 ? 'yellow' : 'red';
    log(`📈 Tasa de éxito: ${successRate}%`, color);
    
    log('='.repeat(50), 'cyan');
    
    // Mostrar errores si los hay
    if (summary.run.failures && summary.run.failures.length > 0) {
        log('\n🚨 ERRORES ENCONTRADOS:', 'red');
        summary.run.failures.forEach((failure, index) => {
            log(`\n${index + 1}. ${failure.source.name || 'Test'}`, 'yellow');
            log(`   Error: ${failure.error.message}`, 'red');
            if (failure.error.test) {
                log(`   Test: ${failure.error.test}`, 'magenta');
            }
        });
    }
    
    log('\n📁 Reportes generados:', 'cyan');
    log(`   📄 JSON: ${config.jsonReport}`, 'blue');
}

// Generar reporte personalizado
function generateCustomReport(summary) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_requests: summary.run.stats.requests.total,
            successful_requests: summary.run.stats.requests.total - summary.run.stats.requests.failed,
            failed_requests: summary.run.stats.requests.failed,
            total_tests: summary.run.stats.tests.total,
            passed_tests: summary.run.stats.tests.passed,
            failed_tests: summary.run.stats.tests.failed,
            success_rate: ((summary.run.stats.tests.passed / summary.run.stats.tests.total) * 100).toFixed(2),
            execution_time_ms: summary.run.timings.completed - summary.run.timings.started
        },
        failures: summary.run.failures?.map(failure => ({
            source: failure.source.name,
            error: failure.error.message,
            test: failure.error.test
        })) || [],
        executions: summary.run.executions?.map(execution => ({
            item: execution.item.name,
            request: {
                method: execution.request?.method,
                url: execution.request?.url?.toString(),
                response_time: execution.response?.responseTime,
                status_code: execution.response?.code,
                status: execution.response?.status
            },
            tests: execution.assertions?.map(assertion => ({
                name: assertion.assertion,
                passed: !assertion.error,
                error: assertion.error?.message
            })) || []
        })) || []
    };
    
    const customReportPath = path.join(config.outputDir, 'custom-report.json');
    fs.writeFileSync(customReportPath, JSON.stringify(report, null, 2));
    log(`   📄 Custom: ${customReportPath}`, 'blue');
}

// Función para pruebas de carga
function runLoadTests(concurrent = 5, iterations = 10) {
    log(`\n🔥 INICIANDO PRUEBAS DE CARGA`, 'yellow');
    log(`👥 Usuarios concurrentes: ${concurrent}`, 'blue');
    log(`🔄 Iteraciones por usuario: ${iterations}`, 'blue');
    
    const promises = [];
    
    for (let i = 0; i < concurrent; i++) {
        const promise = runTests({
            iterationCount: iterations,
            delayRequest: Math.random() * 1000, // Delay aleatorio
            reporters: ['json'], // Solo JSON para pruebas de carga
            reporter: {
                json: {
                    export: path.join(config.outputDir, `load-test-${i}.json`)
                }
            }
        });
        promises.push(promise);
    }
    
    return Promise.all(promises).then(results => {
        log('\n✅ Pruebas de carga completadas', 'green');
        
        // Calcular estadísticas agregadas
        const totalStats = results.reduce((acc, result) => {
            acc.requests += result.run.stats.requests.total;
            acc.failed_requests += result.run.stats.requests.failed;
            acc.tests += result.run.stats.tests.total;
            acc.failed_tests += result.run.stats.tests.failed;
            acc.total_time += result.run.timings.completed - result.run.timings.started;
            return acc;
        }, { requests: 0, failed_requests: 0, tests: 0, failed_tests: 0, total_time: 0 });
        
        log(`📊 Estadísticas agregadas:`, 'cyan');
        log(`   Total requests: ${totalStats.requests}`, 'blue');
        log(`   Requests fallidos: ${totalStats.failed_requests}`, 'blue');
        log(`   Total tests: ${totalStats.tests}`, 'blue');
        log(`   Tests fallidos: ${totalStats.failed_tests}`, 'blue');
        log(`   Tiempo promedio: ${Math.round(totalStats.total_time / concurrent)}ms`, 'blue');
        
        return results;
    });
}

// Función principal
async function main() {
    try {
        // Verificar archivos
        checkFiles();
        
        // Obtener argumentos de línea de comandos
        const args = process.argv.slice(2);
        const isLoadTest = args.includes('--load');
        const concurrent = parseInt(args.find(arg => arg.startsWith('--concurrent='))?.split('=')[1]) || 5;
        const iterations = parseInt(args.find(arg => arg.startsWith('--iterations='))?.split('=')[1]) || 10;
        
        if (isLoadTest) {
            await runLoadTests(concurrent, iterations);
        } else {
            await runTests();
        }
        
        log('\n🎉 Pruebas completadas exitosamente!', 'green');
        process.exit(0);
        
    } catch (error) {
        log('\n💥 Error ejecutando las pruebas:', 'red');
        console.error(error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = {
    runTests,
    runLoadTests,
    checkFiles
};