import type { EnrichedAnforderungenUndRandbedingungen, EnrichedAnnahmen, EnrichedEntscheidungenUndLoesungswege, EnrichedErgebnisseUndGrenzen, EnrichedRegeln } from '@/types/enriched';
import type { AnforderungenUndRandbedingungen, Annahmen, EntscheidungenUndLoesungswege, ErgebnisseUndGrenzen, Regeln, Vorgaenge } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface AnforderungenUndRandbedingungenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
}

export function enrichAnforderungenUndRandbedingungen(
  anforderungenUndRandbedingungen: AnforderungenUndRandbedingungen[],
  maps: AnforderungenUndRandbedingungenMaps
): EnrichedAnforderungenUndRandbedingungen[] {
  return anforderungenUndRandbedingungen.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'titel'),
  }));
}

interface EntscheidungenUndLoesungswegeMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  anforderungenUndRandbedingungenMap: Map<string, AnforderungenUndRandbedingungen>;
}

export function enrichEntscheidungenUndLoesungswege(
  entscheidungenUndLoesungswege: EntscheidungenUndLoesungswege[],
  maps: EntscheidungenUndLoesungswegeMaps
): EnrichedEntscheidungenUndLoesungswege[] {
  return entscheidungenUndLoesungswege.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'titel'),
    anforderungName: resolveDisplay(r.fields.anforderung, maps.anforderungenUndRandbedingungenMap, 'titel'),
  }));
}

interface ErgebnisseUndGrenzenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  entscheidungenUndLoesungswegeMap: Map<string, EntscheidungenUndLoesungswege>;
}

export function enrichErgebnisseUndGrenzen(
  ergebnisseUndGrenzen: ErgebnisseUndGrenzen[],
  maps: ErgebnisseUndGrenzenMaps
): EnrichedErgebnisseUndGrenzen[] {
  return ergebnisseUndGrenzen.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'titel'),
    entscheidungName: resolveDisplay(r.fields.entscheidung, maps.entscheidungenUndLoesungswegeMap, 'titel'),
  }));
}

interface AnnahmenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  ergebnisseUndGrenzenMap: Map<string, ErgebnisseUndGrenzen>;
}

export function enrichAnnahmen(
  annahmen: Annahmen[],
  maps: AnnahmenMaps
): EnrichedAnnahmen[] {
  return annahmen.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'titel'),
    stuetzendes_ergebnisName: resolveDisplay(r.fields.stuetzendes_ergebnis, maps.ergebnisseUndGrenzenMap, 'titel'),
  }));
}

interface RegelnMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  entscheidungenUndLoesungswegeMap: Map<string, EntscheidungenUndLoesungswege>;
  ergebnisseUndGrenzenMap: Map<string, ErgebnisseUndGrenzen>;
  annahmenMap: Map<string, Annahmen>;
}

export function enrichRegeln(
  regeln: Regeln[],
  maps: RegelnMaps
): EnrichedRegeln[] {
  return regeln.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'titel'),
    entscheidungName: resolveDisplay(r.fields.entscheidung, maps.entscheidungenUndLoesungswegeMap, 'titel'),
    ergebnisName: resolveDisplay(r.fields.ergebnis, maps.ergebnisseUndGrenzenMap, 'titel'),
    annahmeName: resolveDisplay(r.fields.annahme, maps.annahmenMap, 'aussage'),
  }));
}
