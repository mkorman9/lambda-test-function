import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import AWS from 'aws-sdk';

const SNS = new AWS.SNS();
const SECRET = process.env.SECRET || 'default-secret';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    if (!isAPIGatewayEvent(event)) {
        return buildResponse(400, {
            status: 'error',
            message: 'invalid trigger'
        });
    }

    const context = event.requestContext;

    if (context.http.method === 'GET' && context.http.path === '/') {
        return buildResponse(200, {
            status: 'ok'
        });
    } else if (context.http.method === 'POST' && context.http.path === '/upload/something') {
        if (!authorizeRequest(event)) {
            return buildResponse(401, {
                status: 'error',
                message: 'authorization failed'
            });
        }

        const body = extractBody(event);

        console.log(`Uploaded ${body}`);

        await sendSnsNotification(body);

        return buildResponse(200, {
            status: 'ok'
        });
    }

    return buildResponse(404, {
        status: 'error',
        message: 'not found'
    });
};

const isAPIGatewayEvent = (event: APIGatewayProxyEventV2): boolean => {
    return 'requestContext' in event && 'http' in event.requestContext;
};

const authorizeRequest = (event: APIGatewayProxyEventV2): boolean => {
    return event.headers['x-secret'] === SECRET;
};

const sendSnsNotification = async (uploadedContent: string) => {
    const createTopicResponse = await SNS.createTopic({
        Name: 'UploadNotifications'
    }).promise();
    const topicArn = createTopicResponse.TopicArn;

    await SNS.publish({
        TopicArn: topicArn,
        Message: uploadedContent
    }).promise();
};

const extractBody = (event: APIGatewayProxyEventV2): string => {
    if (event.isBase64Encoded) {
        return Buffer.from(event.body, 'base64').toString('utf8');
    } else {
        return event.body;
    }
};

const buildResponse = (statusCode: number, responseBody: unknown): APIGatewayProxyResultV2 => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        isBase64Encoded: false,
        body: JSON.stringify(responseBody)
    };
};
