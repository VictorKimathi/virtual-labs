export function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-end justify-center lg:items-center lg:justify-end lg:pr-24"
    >
      <div className="relative mb-48 flex size-64 items-center justify-center sm:size-80 lg:mb-0 lg:size-96">
        <div className="absolute inset-0 rounded-full border-2 border-subject-biology/50 motion-safe:animate-orbit-slow">
          <span className="absolute -top-2 left-1/2 size-4 rounded-full bg-subject-biology" />
        </div>
        <div className="absolute inset-8 rounded-full border-2 border-subject-chemistry/50 motion-safe:animate-orbit-reverse">
          <span className="absolute -top-2 left-1/2 size-4 rounded-full bg-subject-chemistry" />
        </div>
        <div className="absolute inset-16 rounded-full border-2 border-subject-physics/50 motion-safe:animate-orbit">
          <span className="absolute -top-2 left-1/2 size-4 rounded-full bg-subject-physics" />
        </div>
        <div className="size-12 rounded-full bg-kenya-red shadow-2xl shadow-kenya-red/50" />
      </div>
    </div>
  );
}
