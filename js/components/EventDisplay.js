function EventDisplay({ event }) {
  return (
    <div className={`event-notification event-${event.severity}`}>
      <div className="event-title">{event.title}</div>
      <div className="event-description">{event.description}</div>
    </div>
  );
}

export default EventDisplay;

