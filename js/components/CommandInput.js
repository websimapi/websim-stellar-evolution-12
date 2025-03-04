const { useState } = React;

function CommandInput({ onSubmit, disabled }) {
  const [command, setCommand] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (command.trim() && !disabled) {
      onSubmit(command);
      setCommand('');
    }
  };
  
  return (
    <div className="command-input-container">
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <input
          type="text"
          className="command-input"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={disabled ? 'Processing...' : 'Enter your command...'}
          disabled={disabled}
          autoFocus
        />
      </form>
    </div>
  );
}

export default CommandInput;

