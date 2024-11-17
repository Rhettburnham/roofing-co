import { useGSAP } from '@gsap/react';
import gsap from "gsap"
import { watchImg, rightImg } from '../utils';
import VideoCarousel from './VideoCarousel';



const Highlights = () => {
    useGSAP(() => {
        gsap.to('#title', {opacity: 1, y: 0})
        gsap.to('.link', {opacity: 1 , y: 0, duration: 1, stagger: 0.25})
    }, [])
  return (
    <section id="highlights" className="w-screen overflow-hidden h-full">

        <VideoCarousel/>

    </section>
  )
}

export default Highlights