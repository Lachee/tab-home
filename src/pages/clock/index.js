import { Clock } from "./Clock";

export const ClockPage = () => {
    return (
        <div className="clock">
            <h1>It's a clock</h1>
            <Clock width='400px' height='400px'></Clock>
        </div>
    )
};