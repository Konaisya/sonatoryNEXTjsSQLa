import BlurText from "@/components/BlurText";
import CardSwap, { Card } from "@/components/CardSwap";
import MainCard from "@/components/MainCard";
import MainI from "@/components/mainI";
import ScrollVelocity from "@/components/ScrollVelocity";
import SplitText from "@/components/SplitText";





export default function Home() {
  const velocity = 50; 

  return (
    <>
      <main className="flex min-h-screen flex-col justify-between">
        <div
          className="flex flex-col items-center justify-center p-4 mt-20"
          style={{
            position: "relative",
            top: "55%",
            width: "100%",
          }}
        >
          <SplitText
            text="Юность - место здоровья и радости!"
            className="text-5xl font-semibold mb-4"
            delay={50}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <BlurText
            text="Забота, игры и природа — всё для счастливого детства."
            delay={150}
            animateBy="words"
            direction="top"
            className="text-3xl mb-8 text-center m-auto"
          />
          <div className="flex flex-col items-center justify-center p-4 mb-20">
            <MainI />
          </div>
          <div className="mb-20">
            <ScrollVelocity
               texts={[
                'Забота, игры и природа всё для счастливого детства.',
                'Забота, игры и природа всё для счастливого детства.'
              ]}
              velocity={velocity} 
              className="custom-scroll-text text-2xl"
            />
          </div>
        </div>
          <MainCard />
      </main>
          
    </>
  );
}
