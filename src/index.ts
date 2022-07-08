import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2) => {
    const context = event.requestContext;

    if (context.http.method === 'GET' && context.http.path === '/') {
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: 'ok'
            })
        };
    } else if (context.http.method === 'POST' && context.http.path === '/upload/something') {
        let body: string;

        if (event.isBase64Encoded) {
            body = Buffer.from(event.body, 'base64').toString('utf8');
        } else {
            body = event.body;
        }

        console.log(`Uploaded ${body}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                status: 'ok'
            })
        };
    }

    return {
        statusCode: 404,
        body: JSON.stringify({
            status: 'error',
            message: 'not found'
        })
    };
};
