import Image from 'next/image';

interface MenuCardProps {
  name: string;
  flavor?: string;
  ingredients?: string;
  imagePath?: string;
  imageSize?: number;
  price?: string;
  subtitle?: string;
}

export default function MenuCard({ name, flavor, ingredients, imagePath, imageSize = 80, price, subtitle }: MenuCardProps) {
  return (
    <article className="flex items-center gap-6 md:gap-8 mb-10 w-full">
      {imagePath && (
        <div className="w-[80px] shrink-0 flex justify-center items-center">
          <div className="relative aspect-square" style={{ width: imageSize, height: imageSize }}>
            <Image
              alt={name}
              className="object-contain mix-blend-multiply dark:invert dark:mix-blend-screen dark:opacity-90"
              fill
              sizes={`${imageSize}px`}
              src={imagePath}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl font-bold tracking-tight">
            {name}
          </h3>
          {price && (
            <span className="font-serif italic text-black/80 dark:text-white/90 shrink-0">
              {price}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="font-sans text-sm text-black/50 dark:text-white/50 leading-relaxed uppercase tracking-wider mt-1">
            {subtitle}
          </p>
        )}
        {flavor && (
          <p className="font-serif italic text-[1.1rem] leading-snug text-black/80 dark:text-white/90 mt-1 mb-1">
            {flavor}
          </p>
        )}
        {ingredients && (
          <p className="font-sans text-sm text-black/50 dark:text-white/50 leading-relaxed uppercase tracking-wider">
            {ingredients}
          </p>
        )}
      </div>
    </article>
  );
}
