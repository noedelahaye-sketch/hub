import { readFileSync } from 'node:fs';
import { diagnosticDeLaSemaine } from '/Users/noedelahaye/Documents/hub/js/orientation.js';

const donnees = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const jour = new Date(process.argv[3] ?? '2026-08-27T09:00:00');
const d = diagnosticDeLaSemaine(donnees, jour);
const h = (m) => (m == null ? '—' : `${(m / 60).toFixed(1).replace('.0', '')} h`);

console.log(`\n═══ Semaine du ${d.semaine.debut} au ${d.semaine.fin} ═══`);
console.log(`Période : ${d.periode ? d.periode.nom : 'aucune'}`);

for (const [espace, c] of Object.entries(d.charge)) {
  if (!c.total && !c.vise) continue;
  console.log(`\n${espace.toUpperCase()}  ${h(c.total)}${c.vise ? ` / ${h(c.vise)} visées` : ''}`);
  console.log(`  événements ${h(c.evenements)} (${c.seances} séances) · traitement ${h(c.traitement)}`
    + ` · forfaits ${h(c.forfait)} · déclaré ${h(c.declare)}`);
  if (c.nonChiffre) console.log(`  ⚠ ${c.nonChiffre} lignes sans durée : le total est un plancher`);
}

console.log(`\n── FORMATION, la courbe ──`);
console.log(`  reste ${h(d.formation.resteTotal)} · rythme lissé ${h(d.formation.lisse)}/semaine`);
if (d.formation.prochain) {
  const p = d.formation.prochain;
  console.log(`  le plus proche : ${p.nom}, ${h(p.reste)} d'ici le ${p.echeance}`
    + ` → ${h(p.besoin)} cette semaine`);
}
d.formation.livrables.forEach((l) =>
  console.log(`    ${l.echeance}  ${l.nom.padEnd(22)} ${h(l.reste).padStart(7)} → ${h(l.besoin)}/sem`));

console.log(`\n── PERSO, le plancher ──`);
console.log(`  ${JSON.stringify(d.perso.comptes)} · ${d.perso.moments} moments, `
  + `${d.perso.nonClasses} sans famille`);
d.perso.manques.forEach((m) => console.log(`  manque : ${m.famille} ${m.pose}/${m.attendu}`));

console.log(`\n── CE QUE J'AI REMARQUÉ (${d.inferences.length}) ──`);
d.inferences.forEach((i) => {
  console.log(`  • ${i.constat}`);
  if (i.consequence) console.log(`    ${i.consequence}`);
  console.log(`    (d'après ${i.dou})`);
});
