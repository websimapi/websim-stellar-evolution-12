function ImageDisplay({ url }) {
  return (
    <div className="image-container">
      <img src={url} alt="Discovery visualization" className="discovery-image" />
    </div>
  );
}

export default ImageDisplay;

