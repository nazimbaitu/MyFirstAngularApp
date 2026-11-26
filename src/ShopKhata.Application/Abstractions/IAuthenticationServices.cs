using ShopKhata.Domain.Entities;

namespace ShopKhata.Application.Abstractions;

public interface ICredentialVerifier
{
    string Hash(string password);
    bool Verify(string storedHash, string password);
}

public interface ITokenService
{
    string CreateToken(UserAccount user);
}
