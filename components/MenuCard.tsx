import GlassIcon from "./GlassIcon";

const PATH_TO_GLASS: Record<string, string> = {
  "highball": "Highball",
  "coupe": "Coupe",
  "nick&nora": "Nick & Nora",
  "rocks": "Rocks",
  "tiki": "Tiki",
  "beer": "Beer",
  "wine": "Wine",
};

function glassFromPath(imagePath: string): string {
  const key = imagePath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
  return PATH_TO_GLASS[key] ?? key;
}

interface MenuCardProps {
  name: string;
  flavor: string;
  ingredients: string;
  imagePath: string;
}

export default function MenuCard({ name, flavor, ingredients, imagePath }: MenuCardProps) {
  const glass = glassFromPath(imagePath);
  return (
    <article className="flex items-start gap-5 mb-10 w-full">
      <div className="w-[72px] shrink-0 flex justify-center items-center pt-1">
        <div className="w-full aspect-square text-black/60 dark:text-white/50">
          <GlassIcon glass={glass} />
        </div>
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <h3 className="font-serif text-xl font-bold tracking-tight mb-1 leading-tight">
          {name}
        </h3>
        <p className="font-serif italic text-[1.05rem] leading-snug text-black/75 dark:text-white/85 mb-2">
          {flavor}
        </p>
        <p className="font-sans text-[0.7rem] text-black/45 dark:text-white/45 leading-relaxed uppercase tracking-widest">
          {ingredients}
        </p>
      </div>
    </article>
  );
}
