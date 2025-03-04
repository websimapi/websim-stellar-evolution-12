const { forwardRef, useEffect, useRef } = React;

const Terminal = forwardRef(({ content, loading }, ref) => {
  const terminalRef = useRef();
  const containerRef = ref || terminalRef;
  
  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);
  
  return (
    <div className="terminal-container" ref={containerRef}>
      <div className="terminal-content">
        {content.map((item, index) => (
          <div key={index} className="terminal-line">
            {item.type === 'command' && (
              <div className="command-line">
                {'> '}{item.text}
              </div>
            )}
            
            {item.type === 'response' && (
              <div className={`response-line response-${item.tone}`}>
                {item.text}
                
                {item.detailText && (
                  <div className="response-detail">{item.detailText}</div>
                )}
                
                {item.imageUrl && (
                  <ImageDisplay url={item.imageUrl} />
                )}
              </div>
            )}
            
            {item.type === 'system' && (
              <div className="system-message">{item.text}</div>
            )}
          </div>
        ))}
        
        {loading && <LoadingIndicator />}
      </div>
    </div>
  );
});

export default Terminal;

