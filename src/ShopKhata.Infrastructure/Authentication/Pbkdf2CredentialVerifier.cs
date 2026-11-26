using System.Security.Cryptography;
using ShopKhata.Application.Abstractions;

namespace ShopKhata.Infrastructure.Authentication;

public sealed class Pbkdf2CredentialVerifier : ICredentialVerifier
{
    private const int Iterations = 210_000;
    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
        return $"PBKDF2-SHA256${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public bool Verify(string storedHash, string password)
    {
        try
        {
            var parts = storedHash.Split('$');
            if (parts.Length != 4 || parts[0] != "PBKDF2-SHA256" ||
                !int.TryParse(parts[1], out var iterations) || iterations < 100_000 || iterations > 1_000_000)
                return false;
            var salt = Convert.FromBase64String(parts[2]);
            var expected = Convert.FromBase64String(parts[3]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException) { return false; }
        catch (ArgumentException) { return false; }
    }
}
