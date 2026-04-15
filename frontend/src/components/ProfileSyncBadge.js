function ProfileSyncBadge({ status = "local-only", className = "" }) {
  const statusStyles =
    status === "synced"
      ? "bg-green-100 text-green-700"
      : status === "syncing"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  const label =
    status === "synced" ? "Synced" : status === "syncing" ? "Syncing..." : "Local-only";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles} ${className}`}>
      Profile sync: {label}
    </span>
  );
}

export default ProfileSyncBadge;
