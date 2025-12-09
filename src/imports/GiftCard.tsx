import imgImage10 from "figma:asset/74eb863ad4af1dc34ec01054e9dc1a8d54bfee2a.png";
import imgImage11 from "figma:asset/0ce62395feecf426a4a1bc04f69a4320b43c3a7c.png";

export default function GiftCard() {
  return (
    <div className="relative size-full" data-name="Gift Card">
      <div className="absolute h-[857px] left-0 top-[486px] w-[1490px]" data-name="image 10">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage10} />
      </div>
      <div className="absolute h-[486px] left-0 top-0 w-[1494px]" data-name="image 11">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage11} />
      </div>
    </div>
  );
}