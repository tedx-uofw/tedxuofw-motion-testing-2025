import React, { useState } from 'react';
import DotGrid from '../components/LottieTS test 2';
import DotData from '../data/DotData';


const HeroTestPage = () => {
    const [component, changeComponent] = useState(0);

    const handleMenuChange = (e) => {
        changeComponent(e.target.value);
    }

    return (
        <div>
            <h1>HeroTestPage</h1>
            <select value={component} onChange={handleMenuChange}>
                <option value={0}>Component 1</option>
                <option value={1}>Component 2</option>
            </select>

            {component === 0 &&
                <div style={{backgroundColor: 'black'}}>
                    <h2>Component 1</h2>
                    <DotGrid
                        dotSize={10}
                        dotColor={"white"}
                        maxDotSize={30}
                        distanceThreshold={10}
                        dotSpacing={30}
                        gridRows={55}
                        gridColumns={55}
                        smoothFactor={0.5}
                        shape={"circle"}
                        enableLookAt={true}
                    />
                </div>
            }
            {component === 1 &&
                <DotData />
            }
        </div>
    );
};

export default HeroTestPage;