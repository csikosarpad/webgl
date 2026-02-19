import { useState } from 'react';
import JuliaFractal from './components/JuliaFractal';
import PlasmaShader from './components/PlasmaShader';

type DemoType = 'julia' | 'plasma';

interface Demo {
    id: DemoType;
    name: string;
    description: string;
    component: React.ComponentType;
}

const demos: Demo[] = [
    {
        id: 'julia',
        name: 'Julia Fraktál',
        description: 'Animált Julia-halmaz sima színátmenettel',
        component: JuliaFractal,
    },
    {
        id: 'plasma',
        name: 'Plazma',
        description: 'Klasszikus plazma effekt hullámzó mintákkal',
        component: PlasmaShader,
    },
];

export default function App() {
    const [currentDemo, setCurrentDemo] = useState<DemoType>('julia');
    const [showMenu, setShowMenu] = useState(true);

    const activeDemo = demos.find(d => d.id === currentDemo)!;
    const DemoComponent = activeDemo.component;

    return (
        <div className="relative w-full h-full">

            {/* Menu Toggle Button */}
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200"
            >
                {showMenu ? '✕ Menü elrejtése' : '☰ Menü'}
            </button>


            {/* Demo Info */}
            <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <h2 className="font-bold">{activeDemo.name}</h2>
                <p className="text-sm text-gray-300">{activeDemo.description}</p>
            </div>

            {/* Navigation Menu */}
            {showMenu && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-2 flex gap-2">
                    {demos.map(demo => (
                        <button
                            key={demo.id}
                            onClick={() => setCurrentDemo(demo.id)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentDemo === demo.id
                                ? 'bg-white text-black font-bold'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            {demo.name}
                        </button>
                    ))}
                </div>
            )}

            {/* WebGL Canvas */}
            <DemoComponent />

        </div>
    );
}
