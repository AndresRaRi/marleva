const {withDangerousMod}=require('expo/config-plugins');
const fs=require('node:fs/promises');const path=require('node:path');
module.exports=config=>withDangerousMod(config,['android',async config=>{
 const debug=path.join(config.modRequest.platformProjectRoot,'app/src/debug');await fs.mkdir(path.join(debug,'res/raw'),{recursive:true});await fs.mkdir(path.join(debug,'res/xml'),{recursive:true});
 await fs.copyFile(path.join(config.modRequest.projectRoot,'../../infra/local/secrets/ca.crt'),path.join(debug,'res/raw/marleva_local_ca.crt'));
 // Metro serves the local development bundle over loopback HTTP. Only that
 // emulator/host address is allowed in debug; API requests still require HTTPS.
 await fs.writeFile(path.join(debug,'res/xml/network_security_config.xml'),'<network-security-config><base-config cleartextTrafficPermitted="false"><trust-anchors><certificates src="system"/><certificates src="@raw/marleva_local_ca"/></trust-anchors></base-config><domain-config cleartextTrafficPermitted="true"><domain>10.0.2.2</domain><domain>localhost</domain></domain-config></network-security-config>');
 await fs.writeFile(path.join(debug,'AndroidManifest.xml'),'<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application android:networkSecurityConfig="@xml/network_security_config" /></manifest>');
 const wrapper=path.join(config.modRequest.platformProjectRoot,'gradle/wrapper/gradle-wrapper.properties');
 const checksum=(await fs.readFile(path.join(config.modRequest.projectRoot,'../../docs/evidence/gradle-9.3.1.sha256'),'utf8')).trim();
 const properties=await fs.readFile(wrapper,'utf8');if(!properties.includes('gradle-9.3.1-bin.zip'))throw new Error('Gradle wrapper cambió; revisar antes de descargar');
 await fs.writeFile(wrapper,properties.replace(/\ndistributionSha256Sum=.*\n?/g,'\n')+'\ndistributionSha256Sum='+checksum+'\n');
 return config;
}]);
