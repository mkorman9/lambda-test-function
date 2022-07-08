import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2) => {
    const context = event.requestContext;

    if (context.http.method === 'GET' && context.http.path === '/') {
        return buildResponse(200, {
            status: 'ok'
        });
    } else if (context.http.method === 'POST' && context.http.path === '/upload/something') {
        const body = extractBody(event);

        console.log(`Uploaded ${body}`);

        return buildResponse(200, {
            status: 'ok'
        });
    }

    return buildResponse(404, {
        status: 'error',
        message: 'not found'
    });
};

const extractBody = (event: APIGatewayProxyEventV2): String => {
    if (event.isBase64Encoded) {
        return Buffer.from(event.body, 'base64').toString('utf8');
    } else {
        return event.body;
    }
};

const buildResponse = (statusCode: number, responseBody: unknown) => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        isBase64Encoded: false,
        body: JSON.stringify(responseBody)
    };
};
