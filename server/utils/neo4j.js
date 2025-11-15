import neo4j from 'neo4j-driver';

const URI = process.env.NEO4J_URI || 'neo4j+s://9277bb90.databases.neo4j.io';
const USER = process.env.NEO4J_USERNAME || process.env.NEO4J_USER || '<username>';
const PASSWORD = process.env.NEO4J_PASSWORD || '<password>';

let driver;

try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    
    // Verify connection
    (async () => {
        try {
            const serverInfo = await driver.getServerInfo();
            console.log('✅ Neo4j connection established');
            console.log(`   Server: ${serverInfo.address}`);
        } catch (error) {
            console.error('❌ Neo4j connection error:', error.message);
        }
    })();
} catch (error) {
    console.error('❌ Failed to create Neo4j driver:', error.message);
}

export { driver };

