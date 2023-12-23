import Carousel from "react-bootstrap/Carousel";
import "./slider.css";

function Slider() {
  return (
    <Carousel fade data-aos="fade-up">
      <Carousel.Item interval={2800}>
        <img
          className="d-block w-100 rounded-1"
          src="https://www.elconfidencialdigital.com/asset/thumbnail,1920,1080,center,center/media/elconfidencialdigital/images/2022/09/20/2022092010413510443.jpg"
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item interval={2800}>
        <img
          className="d-block w-100 rounded-1"
          src="https://images.pexels.com/photos/1342641/pexels-photo-1342641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Second slide"
        />
      </Carousel.Item>

      <Carousel.Item interval={2800}>
        <img
          className="d-block w-100 rounded-1"
          src="https://media.licdn.com/dms/image/D4E12AQGCqVPAwMKWbA/article-cover_image-shrink_720_1280/0/1687718564721?e=1708560000&v=beta&t=egbR9aPlS2yv8-qShcNGSARyvkep3QDq9Q2O0_melws"
          alt="Third slide"
        />
      </Carousel.Item>

      <Carousel.Item interval={2800}>
        <img
          className="d-block w-100 rounded-1"
          src="https://www.gastrolabweb.com/u/fotografias/fotosnoticias/2023/2/9/42117.jpg"
          alt="Third slide"
        />
      </Carousel.Item>

      <Carousel.Item interval={2800}>
        <img
          className="d-block w-100 rounded-1"
          src="https://smallbusinessadvisory.com/wp-content/uploads/2022/07/small-business3-1024x614.jpg"
          alt="four slide"
        />
      </Carousel.Item>
    </Carousel>
  );
}

export default Slider;
