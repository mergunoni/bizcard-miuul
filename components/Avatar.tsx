type AvatarProps = {
  initials: string;
};

export function Avatar({ initials }: AvatarProps) {
  return (
    <div className="avatar" aria-hidden="true">
      {initials}
    </div>
  );
}
