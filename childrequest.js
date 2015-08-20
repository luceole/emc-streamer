var hyperquest = require('hyperquest');
cible = process.argv[2];
//console.log(cible);
hyperquest(cible).pipe(process.stdout);
