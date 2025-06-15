import { ShowerHead, Bath, Hand } from "lucide-react";
import CardSwap, { Card } from "./CardSwap";
import Link from "next/link";

const MainCard = () => {
    return ( 
         <div className="text-white flex max-w-[1700px] items-center justify-center m-auto flex-wrap">
            <div className="flex flex-col w-1/3 p-10 mr-20  ">
              <h2 className="text-black text-4xl text-left mb-4">Полезные процедуры для крепкого здоровья!</h2>
              <p className="text-black text-lg text-left">Каждая процедура подобрана с заботой о вашем ребёнке и направлена на укрепление иммунитета и общее оздоровление</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <Link href="/service">
                Выбрать курс оздоровления
                </Link>
              </button>
            </div>
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={5000}
            pauseOnHover={false}
          >
            <Card className="bg-emerald-700 p-12">
                <Bath className="w-12 h-12"/> 
                <h3 className="text-3xl mb-3">Хвойные или лавандовые ванны</h3>
                <p>Чередование тёплой и прохладной воды помогает тренировать сосуды, бодрит и укрепляет иммунитет. Весёлый способ закаливания, который делает ребёнка выносливее и активнее!</p>
            </Card>
            <Card className="bg-red-900 p-12">
                <Hand className="w-12 h-12"/>
                <h3 className="text-3xl mb-3">Профилактический массаж спины и стоп</h3>
                <p>Лёгкий и приятный массаж снимает напряжение, улучшает осанку и помогает при утомлении. Особенно полезен после активных игр и занятий — для отдыха и восстановления.</p>
            </Card>
            <Card className="bg-blue-800 p-12">
                <ShowerHead className="w-12 h-12"/>
                <h3 className="text-3xl mb-3">Контрастные души</h3>
                <p>Ароматные ванны с натуральными экстрактами расслабляют, укрепляют нервную систему и улучшают сон. Мягкое тепло и природные ароматы — настоящее удовольствие для здоровья!</p>
            </Card>
          </CardSwap>

        </div>
     );
}
 
export default MainCard;