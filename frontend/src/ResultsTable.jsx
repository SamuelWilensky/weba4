import './App.css'

function ResultsTable(data) {

    const data2 = Array.from(data);
    console.log(data2);

    return (
        <table className="bg-LightTeal text-Purple">
            <thead>
            <tr><th>Username</th><th>Name</th><th>Intro</th><th>Favorite Mechanic</th><th>Color</th><th>Games Played</th></tr>
            </thead>
            <tbody id="resultsTable">

            </tbody>
        </table>
    )
}

export default ResultsTable
