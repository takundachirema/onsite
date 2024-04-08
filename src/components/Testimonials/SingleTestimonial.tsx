import { type Testimonial } from "$/src/types/testimonial";
import { Card, CardBody } from "@nextui-org/react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";

const SingleTestimonial = ({ testimonial }: { testimonial: Testimonial }) => {
  const { star, name, image, content, designation } = testimonial;

  const ratingIcons = [];
  for (let index = 0; index < star; index++) {
    ratingIcons.push(
      <span key={index} className="text-yellow">
        <FaStar />
      </span>,
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="shadow-two hover:shadow-one rounded-sm p-8 duration-300 lg:px-5 xl:px-8">
          <div className="mb-5 flex items-center space-x-6">{ratingIcons}</div>
          <p className="border-body-color text-body-color mb-8 border-b border-opacity-10 pb-8 text-base leading-relaxed dark:border-white dark:border-opacity-10 dark:text-white">
            “{content}
          </p>
          <div className="flex items-center">
            <div className="relative mr-4 h-[50px] w-full max-w-[50px] overflow-hidden rounded-full">
              <Image src={image} alt={name} fill />
            </div>
            <div className="w-full">
              <h3 className="text-dark mb-1 text-lg font-semibold dark:text-white lg:text-base xl:text-lg">
                {name}
              </h3>
              <p className="text-body-color text-sm">{designation}</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SingleTestimonial;
