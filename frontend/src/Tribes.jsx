import React, { useState } from 'react';

function Tribes() {
    class Tribe {
        constructor(name, amountMembers, costPerMonth) {
            this.name = name;
            this.amountMembers = amountMembers;
            this.costPerMonth = costPerMonth;
        }
    }

    // State to hold the tribes
    const [tribes, setTribes] = useState([
        new Tribe("fitnessGang", 200, 99),
        new Tribe("traderGang", 512, 149)
    ]);

    // State for form inputs
    const [tribeName, setTribeName] = useState('');
    const [amountMembers, setAmountMembers] = useState('');
    const [costPerMonth, setCostPerMonth] = useState('');

    // Function to handle form submission
    const handleSubmit = () => {
        const newTribe = new Tribe(tribeName, Number(amountMembers), Number(costPerMonth));
        setTribes([...tribes, newTribe]);

        // Reset input fields
        setTribeName('');
        setAmountMembers('');
        setCostPerMonth('');
    };

    return (
        <div className='container'>
            <div>
                <h1>Add your Tribe!</h1>
                <input
                    type="text"
                    placeholder="Tribe Name"
                    value={tribeName}
                    onChange={(e) => setTribeName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount of Tribe members"
                    value={amountMembers}
                    onChange={(e) => setAmountMembers(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Cost per month"
                    value={costPerMonth}
                    onChange={(e) => setCostPerMonth(e.target.value)}
                />
                <button onClick={handleSubmit}>Submit</button>
            </div>
            <div className='tribe-list'>
                {tribes.map((tribe, index) => (
                    <div key={index} className='tribe-card'>
                        <p>{tribe.name}</p>
                        <p>{tribe.amountMembers + " tribe members"}</p>
                        <p>{tribe.costPerMonth + "$/month"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tribes;