import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly sessionsService: UserService) {
        const jwtSecret = process.env.JWTKEY;
        if (!jwtSecret) {
            throw new Error("JWTKEY environment variable is not set");
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: any, ..._: any[]): Promise<any> {
        const sessionId = payload.session.id;

        if (!sessionId) {
            throw new UnauthorizedException();
        }

        const session = await this.sessionsService.findOneById(sessionId);

        return {
            user: payload.user,
            session: session,
        };
    }
}