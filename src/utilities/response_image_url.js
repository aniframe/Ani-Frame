require('dotenv').config();

async function update_path(foldername, data) {
    if (!data || data.length === 0) {
        return null;
    }
    var updated_data;
    updated_data = process.env.SERVER_URL + "/src/public/uploads/images/" + foldername + "/" + data;
    // console.log(updated_data);
    return updated_data;
}

module.exports = update_path;  