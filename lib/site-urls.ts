// URLs entre la web principal y backstage (solo cliente): backstage.<host> <-> <host>.
export function mainSiteUrl(path: string): string {
  const { protocol, host } = window.location;
  return `${protocol}//${host.replace(/^backstage\./i, "")}${path}`;
}

export function backstageUrl(path: string): string {
  const { protocol, host } = window.location;
  const main = host.replace(/^backstage\./i, "").replace(/^www\./i, "");
  return `${protocol}//backstage.${main}${path}`;
}
