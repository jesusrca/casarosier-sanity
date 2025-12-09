import imgImage1 from "figma:asset/08f0317955567ad1d371a8d36fab0e7bebaf15b7.png";
import imgImage2 from "figma:asset/e7b34d73c5e8ced5d34efdef16ba1a786a001566.png";
import imgImage3 from "figma:asset/4945d4655c2a650c6835016a800a3d05d59474fa.png";
import imgImage4 from "figma:asset/aea5cc063fe10af957c707ebc6a0511d5f2c787f.png";

export default function Home() {
  return (
    <div className="relative size-full" data-name="Home">
      <div className="absolute h-[691px] left-[4px] top-0 w-[1495px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[596px] left-0 top-[691px] w-[1499px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
      <div className="absolute h-[859px] left-0 top-[1287px] w-[1502px]" data-name="image 3">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
      <div className="absolute h-[551px] left-0 top-[2146px] w-[1497px]" data-name="image 4">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage4} />
      </div>
    </div>
  );
}