export default function useDateFormatter() {

    const renderAMPM = (isoDate: Date) => {
        return new Date(isoDate).getHours() >= 12 ? "PM" : "AM";
    }

    const isMultiDay = (startDateTime: Date, endDateTime: Date): boolean => {

        const dayMs = 60 * 60 * 24 * 1000;
        const ms = endDateTime.getTime() - startDateTime.getTime()
        if (ms <= 0) throw new Error("DateTime range is not valid.")

        if (dayMs < ms) return true;
        return false;
    }

    const renderHourly = (isoDate: Date) => {
        const date = new Date(isoDate)
        const pad = (n: number) => n.toString().padStart(2, "0");

        let hours = date.getHours();
        const minutes = date.getMinutes();
        // const seconds = pad(date.getSeconds());

        const ampm = renderAMPM(isoDate);

        hours = hours % 12;
        if (hours === 0) hours = 12; // midnight/noon fix

        return `${pad(hours)}:${pad(minutes)} ${ampm}`;
    }

    const renderDailyHourly = (isoDate: Date) => {
        const date = new Date(isoDate)
        const pad = (n: number) => n.toString().padStart(2, "0");

        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());

        let hours = date.getHours();
        const minutes = pad(date.getMinutes());

        const ampm = renderAMPM(isoDate)

        hours = hours % 12;
        if (hours === 0) hours = 12; // midnight/noon fix

        return `${month}/${day}, ${pad(hours)}:${minutes} ${ampm}`;
    }   

    return {
        isMultiDay,
        renderHourly,
        renderDailyHourly
    }
}
