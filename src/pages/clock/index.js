import { Clock } from "./Clock";

export const ClockPage = () => {
    return (
        <div className="clock">
            <h1>It's a clock</h1>
            <Clock width='640px' height='425px'></Clock>
        </div>
    )
};