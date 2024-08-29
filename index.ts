import app from "./app";
import { connect } from "./database";

app.listen(app.get("port"), async() => {
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
});