function ResourceDisplay({ icon, value, label }) {
  return (
    <div className="resource-item">
      <span className="resource-icon">{icon}</span>
      <span className="resource-value">{value}</span>
      <span className="resource-label">{label}</span>
    </div>
  );
}

export default ResourceDisplay;

